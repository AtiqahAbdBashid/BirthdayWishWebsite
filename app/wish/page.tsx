'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient, getCurrentUser } from '../../lib/supabase/client';
import { Camera, Upload, X, Edit2, Trash2, Save, ArrowLeft, Video, StopCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BirthdayCountdown from '../../components/BirthdayCountdown';


type WishType = 'text' | 'image' | 'video';
type Wish = {
    id: string;
    name: string;
    type: WishType;
    message: string | null;
    file_url: string | null;
    created_at: string;
};

export default function WishPage() {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'preview'>('form');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [wishType, setWishType] = useState<WishType>('text');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [myWish, setMyWish] = useState<Wish | null>(null);
    const [editing, setEditing] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showVerifiedPopup, setShowVerifiedPopup] = useState(false);
    const [userWishes, setUserWishes] = useState<Wish[]>([]);
    const [allWishes, setAllWishes] = useState<Wish[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageName, setSelectedImageName] = useState<string>('');

    // Camera recording states
    const [showCamera, setShowCamera] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [deviceType, setDeviceType] = useState<'iphone' | 'android' | 'other'>('other');


    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const cameraVideoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const supabase = createClient();

    // Add this with your other useEffects
    useEffect(() => {
        const currentVersion = 'v2.5';
        if (sessionStorage.getItem('appVersion') !== currentVersion) {
            sessionStorage.setItem('appVersion', currentVersion);
            window.location.reload();
        }
    }, []);
    // Check authentication on mount
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const user = await getCurrentUser();
        if (!user) {
            router.push('/login?redirect=/wish');
            return;
        }
        setCurrentUser(user);
        loadMyWish(user.id);
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // useEffect to detect iPhone
    useEffect(() => {
        const ua = navigator.userAgent;
        if (/iPhone/i.test(ua)) {
            setDeviceType('iphone');
        } else if (/Android/i.test(ua)) {
            setDeviceType('android');
        }
    }, []);

    // Add this after your other useEffects
    useEffect(() => {
        // Check if user just verified email
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('confirmed') === 'true') {
            setShowVerifiedPopup(true);
            // Auto-hide after 5 seconds
            setTimeout(() => setShowVerifiedPopup(false), 5000);
            // Remove the parameter from URL (cleanup)
            const url = new URL(window.location.href);
            url.searchParams.delete('confirmed');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    const loadMyWish = async (userId?: string) => {
        try {
            // Use provided userId or get current user
            let user = currentUser;
            if (!user && !userId) {
                user = await getCurrentUser();
                if (!user) {
                    router.push('/login?redirect=/wish');
                    return;
                }
                setCurrentUser(user);
            }

            const uid = userId || user?.id || currentUser?.id;
            if (!uid) {
                router.push('/login?redirect=/wish');
                return;
            }

            console.log('Loading wishes for user:', uid);

            const { data, error } = await supabase
                .from('wishes')
                .select('*')
                .eq('user_id', uid)
                .order('created_at', { ascending: false });

            console.log('Load result:', { data, error });

            if (error) {
                console.error('Error loading wishes:', error);
                return;
            }

            // Set all user wishes
            setAllWishes(data || []);
            setUserWishes(data || []);

            // If there's at least one wish, show preview
            if (data && data.length > 0) {
                setMyWish(data[0]);
                setStep('preview');
            } else {
                // No wishes, show form
                setMyWish(null);
                setStep('form');
            }
        } catch (error) {
            console.error('Error in loadMyWish:', error);
        }
    };


    // Video compression function with fixes
    const compressVideo = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            // Create video element to load the file
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.playsInline = true;
            video.muted = true;

            video.onloadedmetadata = () => {
                // Create canvas to capture video frames
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Get stream from canvas
                const stream = canvas.captureStream(30); // 30 fps

                // Try to add audio track from original video
                // @ts-ignore - captureStream is experimental but works
                const videoStream = video.captureStream();
                const audioTracks = videoStream.getAudioTracks();
                if (audioTracks.length > 0) {
                    stream.addTrack(audioTracks[0]);
                }

                // Determine bitrate based on target size
                const targetBitrate = 2_500_000; // 2.5 Mbps for better quality at 10MB

                // Check supported MIME types
                const mimeTypes = [
                    'video/webm; codecs=vp9,opus',
                    'video/webm; codecs=vp8,opus',
                    'video/webm'
                ];

                let selectedMimeType = 'video/webm';
                for (const mimeType of mimeTypes) {
                    if (MediaRecorder.isTypeSupported(mimeType)) {
                        selectedMimeType = mimeType;
                        break;
                    }
                }

                console.log(`Using MIME type: ${selectedMimeType}`);

                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: selectedMimeType,
                    videoBitsPerSecond: targetBitrate,
                });

                const chunks: Blob[] = [];
                let chunkCount = 0;

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                        chunkCount++;
                        // Update progress (rough estimate based on chunks)
                        setCompressionProgress(prev => Math.min(prev + 5, 90));
                        console.log(`Chunk ${chunkCount} collected: ${e.data.size} bytes`);
                    } else {
                        console.warn('Empty chunk received');
                    }
                };

                mediaRecorder.onstop = () => {
                    if (chunks.length === 0) {
                        reject(new Error('No data chunks collected during compression'));
                        return;
                    }

                    const totalSize = chunks.reduce((acc, chunk) => acc + chunk.size, 0);
                    console.log(`Compression complete: ${chunks.length} chunks, total ${totalSize} bytes`);

                    const compressedBlob = new Blob(chunks, { type: 'video/webm' });
                    const compressedFile = new File(
                        [compressedBlob],
                        file.name.replace(/\.[^/.]+$/, '') + '-compressed.webm',
                        { type: 'video/webm' }
                    );

                    // Clean up
                    URL.revokeObjectURL(video.src);
                    setCompressionProgress(100);
                    setTimeout(() => setCompressionProgress(0), 500);
                    resolve(compressedFile);
                };

                mediaRecorder.onerror = (err) => {
                    console.error('MediaRecorder error:', err);
                    reject(err);
                };

                // Start recording and playback with timeslice (1 second)
                video.play();
                mediaRecorder.start(1000); // Collect data every second

                // Stop recording when video ends
                video.onended = () => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                };

                // Safety timeout based on video duration
                const safetyTimeout = (video.duration * 1000) + 5000; // Video length + 5 seconds
                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        console.log('Safety timeout reached, stopping recording');
                        mediaRecorder.stop();
                    }
                }, safetyTimeout);
            };

            video.onerror = (err) => {
                console.error('Video loading error:', err);
                reject(err);
            };

            video.src = URL.createObjectURL(file);
        });
    };

    // Camera functions with fixes
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setCameraStream(stream);
            setShowCamera(true);

            // Wait for video element to be ready
            setTimeout(() => {
                if (cameraVideoRef.current) {
                    cameraVideoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please make sure you have given permission.');
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
        setIsRecording(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setRecordingTime(0);
    };

    const startRecording = () => {
        if (!cameraStream) return;

        recordedChunksRef.current = [];

        // Check supported MIME types
        const mimeTypes = [
            'video/webm; codecs=vp9,opus',
            'video/webm; codecs=vp8,opus',
            'video/webm'
        ];

        let selectedMimeType = 'video/webm';
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                selectedMimeType = mimeType;
                break;
            }
        }

        const mediaRecorder = new MediaRecorder(cameraStream, {
            mimeType: selectedMimeType
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
                console.log(`Camera chunk collected: ${event.data.size} bytes`);
            }
        };

        mediaRecorder.onstop = async () => {
            if (recordedChunksRef.current.length === 0) {
                alert('Recording failed: No data captured. Please try again.');
                stopCamera();
                return;
            }

            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            console.log(`Final recording size: ${blob.size} bytes`);

            // Create file from blob
            const fileName = `recording-${Date.now()}.webm`;
            let videoFile = new File([blob], fileName, { type: 'video/webm' });

            // Check if compression is needed (camera videos can be up to 15MB)
            if (blob.size > 15 * 1024 * 1024) {
                setCompressing(true);
                setCompressionProgress(0);
                try {
                    // Save the blob to a file first
                    const tempFile = new File([blob], fileName, { type: 'video/webm' });
                    videoFile = await compressVideo(tempFile);
                    setCompressing(false);
                } catch (error) {
                    console.error('Compression failed:', error);
                    alert('Video compression failed. Please try a shorter video (max 15MB).');
                    setCompressing(false);
                    return;
                }
            } else if (blob.size > 10 * 1024 * 1024) {
                // Between 10-15MB, warn but still accept
                alert('Recording is between 10-15MB. It will be accepted but may take longer to upload.');
            }

            setRecordedVideo(blob);
            setFile(videoFile);

            // Create preview URL
            const url = URL.createObjectURL(videoFile);
            setFilePreview(url);

            // Stop camera
            stopCamera();
        };

        // Start recording with timeslice (1 second)
        mediaRecorder.start(1000);
        setIsRecording(true);

        // Start timer
        let seconds = 0;
        timerRef.current = setInterval(() => {
            seconds++;
            setRecordingTime(seconds);

            // Auto-stop after 45 seconds to prevent huge files (15MB limit)
            if (seconds >= 45) {
                alert('Maximum recording time reached (45 seconds). Stopping recording.');
                stopRecording();
            }
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Check initial file size (allow up to 100MB for compression attempt)
        const maxInitialSize = 100 * 1024 * 1024; // 100MB initial limit
        if (selectedFile.size > maxInitialSize) {
            alert(`File too large! Maximum initial size is 100MB.`);
            return;
        }

        setLoading(true);

        try {
            let processedFile = selectedFile;

            // Compress video if it's a video file and larger than 10MB
            if (wishType === 'video' && selectedFile.size > 10 * 1024 * 1024) {
                setCompressing(true);
                setCompressionProgress(0);
                try {
                    processedFile = await compressVideo(selectedFile);
                    setCompressing(false);
                } catch (error) {
                    console.error('Compression failed:', error);
                    alert('Video compression failed. Please try a shorter or smaller video (max 10MB after compression).');
                    setCompressing(false);
                    setLoading(false);
                    return;
                }
            }

            // Check final file size
            const maxFinalSize = wishType === 'video' ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
            if (processedFile.size > maxFinalSize) {
                alert(`File too big even after compression! Max size: ${maxFinalSize / 1024 / 1024}MB`);
                setLoading(false);
                return;
            }

            setFile(processedFile);
            setFilePreview(URL.createObjectURL(processedFile));
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter your name!');
            return;
        }

        if (wishType === 'text' && !message.trim()) {
            alert('Please enter your message!');
            return;
        }

        if (!currentUser) {
            router.push('/login?redirect=/wish');
            return;
        }

        setLoading(true);
        setSubmitSuccess(false);

        try {
            let fileUrl = '';

            // Upload file if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('wish-media')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    alert('Failed to upload file. Please try again.');
                    setLoading(false);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('wish-media')
                    .getPublicUrl(fileName);

                fileUrl = publicUrl;
            }

            // Save wish to database
            const wishData = {
                name: name.trim(),
                type: wishType,
                message: message.trim() || null,
                file_url: fileUrl || null,
                user_id: currentUser.id,
            };

            console.log('Saving wish:', wishData);

            let result;
            if (editing && myWish) {
                // Update existing wish
                result = await supabase
                    .from('wishes')
                    .update(wishData)
                    .eq('id', myWish.id)
                    .eq('user_id', currentUser.id); // Extra safety check
            } else {
                // Insert new wish
                result = await supabase
                    .from('wishes')
                    .insert([wishData]);
            }

            const { error } = result;
            if (error) {
                console.error('Database error:', error);
                alert('Failed to save wish. Please try again.');
                setLoading(false);
                return;
            }

            console.log('Wish saved successfully');
            setSubmitSuccess(true);

            // Reload the wish to show preview
            await loadMyWish(currentUser.id);

        } catch (error) {
            console.error('Error saving wish:', error);
            alert('Failed to save wish. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (wishId?: string) => {
        // Get the wish ID from parameter or from current wish
        const idToDelete = wishId || myWish?.id;

        if (!idToDelete) {
            alert('No wish selected to delete');
            return;
        }

        if (!confirm('Are you sure you want to delete this wish?')) return;
        if (!currentUser) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('wishes')
                .delete()
                .eq('id', idToDelete)
                .eq('user_id', currentUser.id);

            if (error) {
                console.error('Delete error:', error);
                alert('Failed to delete wish');
                setLoading(false);
                return;
            }

            // Refresh the wish list from database
            const { data: updatedWishes, error: fetchError } = await supabase
                .from('wishes')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error refreshing wishes:', fetchError);
            } else {
                // Update all wishes state
                setAllWishes(updatedWishes || []);
                setUserWishes(updatedWishes || []);

                // If there are still wishes, show preview
                if (updatedWishes && updatedWishes.length > 0) {
                    setMyWish(updatedWishes[0]);
                    setStep('preview');
                } else {
                    // No wishes left, reset to form
                    setMyWish(null);
                    setStep('form');
                    // Reset all form fields
                    setName('');
                    setMessage('');
                    setFile(null);
                    setFilePreview('');
                    setWishType('text');
                    setEditing(false);
                }
            }

        } catch (error) {
            console.error('Error deleting wish:', error);
            alert('Failed to delete wish');
        } finally {
            setLoading(false);
        }
    };

    const selectWishToEdit = (wish: Wish) => {
        setMyWish(wish);
        setName(wish.name);
        setMessage(wish.message || '');
        setWishType(wish.type);
        setEditing(true);
        setStep('form');
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const startEditing = () => {
        if (myWish) {
            setName(myWish.name);
            setMessage(myWish.message || '');
            setWishType(myWish.type);
            // If there was a file, we can't restore it easily, so just indicate we're editing
            setFile(null);
            setFilePreview('');
            setEditing(true);
            setStep('form');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-pastel-blue/20 to-pastel-yellow/20 p-4">
            <div className="max-w-2xl mx-auto pt-8">
                {/* Back to home link */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-pastel-pink transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>

                    {/* Logout button */}
                    {currentUser && (
                        <button
                            onClick={handleLogout}
                            className="text-sm text-pastel-blue hover:underline"
                            style={{ color: '#A7C7E7' }}
                        >
                            Logout
                        </button>
                    )}
                </div>
                {/* Verified Success Popup */}
                {showVerifiedPopup && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in">
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-xl flex items-start gap-3 max-w-md">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-green-800">Email Verified! 🎉</p>
                                <p className="text-sm text-green-700 mt-1">
                                    Your email has been successfully verified. You can now send your birthday wish!
                                </p>
                            </div>
                            <button
                                onClick={() => setShowVerifiedPopup(false)}
                                className="text-green-700 hover:text-green-900"
                                aria-label="Close"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">

                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: '#d45673ff' }}>
                        Send Your Wish 🎂
                    </h1>
                    <p className="text-center text-gray-600 mb-2">
                        Send Lynda a birthday message, photo, or short video!
                    </p>

                    {/* Birthday Countdown - Centered */}
                    <div className="flex justify-center w-full">
                        <BirthdayCountdown />
                    </div>

                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                                    style={{ borderColor: '#A7C7E7', color: '#d45673ff' }}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            {/* Wish Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Choose how to wish
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setWishType('text')}
                                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${wishType === 'text'
                                            ? 'border-pastel-pink bg-pastel-pink/10'
                                            : 'border-gray-200 hover:border-pastel-blue'
                                            }`}
                                    >
                                        💬 Text
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWishType('image')}
                                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${wishType === 'image'
                                            ? 'border-pastel-pink bg-pastel-pink/10'
                                            : 'border-gray-200 hover:border-pastel-blue'
                                            }`}
                                    >
                                        🖼️ Image
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWishType('video')}
                                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${wishType === 'video'
                                            ? 'border-pastel-pink bg-pastel-pink/10'
                                            : 'border-gray-200 hover:border-pastel-blue'
                                            }`}
                                    >
                                        🎥 Video
                                    </button>
                                </div>
                            </div>

                            {/* iPhone tip for video */}
                            {wishType === 'video' && typeof window !== 'undefined' && /iPhone/i.test(navigator.userAgent) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg">📱</span>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">
                                                iPhone users: Your videos may be large (4K default)
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                For faster uploads: Settings → Camera → Record Video → select "1080p at 30fps"
                                            </p>
                                            <p className="text-xs text-blue-500 mt-1">
                                                Don't worry, we'll still compress it automatically!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* File Upload for Image/Video */}
                            {(wishType === 'image' || wishType === 'video') && !showCamera && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {wishType === 'video'
                                            ? 'Upload Video (max 10MB, will compress if larger)'
                                            : 'Upload Image (max 2MB)'}
                                    </label>

                                    {/* Camera recording option for video */}
                                    {wishType === 'video' && (
                                        <button
                                            type="button"
                                            onClick={startCamera}
                                            className="w-full mb-3 py-3 rounded-xl border-2 border-pastel-blue text-pastel-blue flex items-center justify-center gap-2 hover:bg-pastel-blue/10 transition-colors"
                                        >
                                            <Video size={20} />
                                            Record video with camera (max 15MB)
                                        </button>
                                    )}

                                    <div
                                        onClick={() => !loading && !compressing && (wishType === 'video' ? videoInputRef.current?.click() : fileInputRef.current?.click())}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-pastel-pink transition-colors ${(loading || compressing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ borderColor: '#A7C7E7' }}
                                    >
                                        {compressing ? (
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-pink mx-auto mb-4"></div>
                                                <p className="text-gray-600">Compressing video... {compressionProgress}%</p>
                                                <p className="text-xs text-gray-400 mt-2">This may take 10-30 seconds for large files</p>
                                            </div>
                                        ) : filePreview ? (
                                            <div className="relative">
                                                {wishType === 'image' ? (
                                                    <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                                ) : (
                                                    <video src={filePreview} className="max-h-48 mx-auto rounded-lg" controls />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFile(null);
                                                        setFilePreview('');
                                                        setRecordedVideo(null);
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="mx-auto mb-2" size={32} style={{ color: '#A7C7E7' }} />
                                                <p className="text-gray-600">
                                                    Click to upload {wishType === 'video' ? 'video' : 'image'}
                                                </p>
                                                {wishType === 'video' && (
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Large videos will be compressed to 10MB automatically
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={wishType === 'video' ? videoInputRef : fileInputRef}
                                        type="file"
                                        accept={wishType === 'video' ? 'video/*' : 'image/*'}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={loading || compressing}
                                    />
                                </div>
                            )}

                            {/* Camera Recording Interface */}
                            {showCamera && (
                                <div className="border-2 rounded-xl p-4" style={{ borderColor: '#A7C7E7' }}>
                                    <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: '#FFD1DC' }}>
                                        Record Your Video Message
                                    </h3>

                                    <div className="relative">
                                        <video
                                            ref={cameraVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full rounded-lg bg-black"
                                        />

                                        {isRecording && (
                                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                                                <span className="animate-pulse">●</span>
                                                {formatTime(recordingTime)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-center gap-4 mt-4">
                                        {!isRecording ? (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                className="px-6 py-3 rounded-full bg-red-500 text-white flex items-center gap-2 hover:bg-red-600 transition-colors"
                                            >
                                                <Video size={20} />
                                                Start Recording
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                className="px-6 py-3 rounded-full bg-gray-700 text-white flex items-center gap-2 hover:bg-gray-800 transition-colors"
                                            >
                                                <StopCircle size={20} />
                                                Stop Recording
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={stopCamera}
                                            className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <p className="text-xs text-center mt-3 text-gray-500">
                                        Max 45 seconds recording • Camera videos up to 15MB • Will compress if needed
                                    </p>
                                </div>
                            )}

                            {/* Message Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Message {wishType === 'text' ? '*' : '(Optional)'}
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                                    style={{ borderColor: '#A7C7E7', color: '#d45673ff' }}
                                    placeholder={wishType === 'text' ? "Write your birthday message..." : "Add a caption (optional)"}
                                    required={wishType === 'text'}
                                />
                            </div>

                            {/* Submit Button Section - Updated with Delete */}
                            <div className="flex gap-3">
                                {/* Update/Send Button */}
                                <button
                                    type="submit"
                                    disabled={loading || compressing}
                                    className="flex-1 py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50"
                                    style={{ backgroundColor: '#d45673ff' }}
                                >
                                    {loading ? 'Saving...' : compressing ? `Compressing... ${compressionProgress}%` : editing ? 'Update Wish ✨' : 'Send Wish 🎁'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete()}
                                    disabled={loading}
                                    className="px-6 py-4 rounded-xl bg-red-500 text-white font-bold text-lg transition-all transform hover:scale-105 hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Delete
                                </button>
                            </div>

                            {/* Cancel edit button */}
                            {editing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        setStep('preview');
                                    }}
                                    className="w-full py-3 rounded-xl border-2 font-medium transition-colors"
                                    style={{ borderColor: '#A7C7E7', color: '#A7C7E7' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    )}
                    {/* ADD THIS CANCEL BUTTON FOR "ADD ANOTHER WISH" */}
                    {step === 'form' && allWishes.length > 0 && !editing && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => {
                                    setStep('preview');
                                    setName('');
                                    setMessage('');
                                    setFile(null);
                                    setFilePreview('');
                                    setWishType('text');
                                }}
                                className="text-sm text-pastel-blue hover:underline flex items-center justify-center gap-1 mx-auto transition-colors py-2"
                                style={{ color: '#3a84ceff' }}
                            >
                                ← Cancel and return to your wishes
                            </button>
                        </div>
                    )}

                    {/* Preview Section */}
                    {step === 'preview' && allWishes.length > 0 && (
                        <div className="space-y-8">
                            {/* All Wishes List - Each wish displayed the same way */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-center" style={{ color: '#6295c8ff' }}>
                                    Your Wishes
                                </h2>

                                {allWishes.map((wish) => (
                                    <div
                                        key={wish.id}
                                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50"
                                    >
                                        <div className="p-4 bg-gradient-to-r from-pastel-pink/10 to-pastel-blue/10">
                                            <p className="font-semibold text-lg mb-2" style={{ color: '#d45673ff' }}>
                                                {wish.name}
                                            </p>

                                            {/* Media Content */}
                                            {wish.file_url && (
                                                <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                                                    {wish.type === 'image' ? (
                                                        <div
                                                            className="cursor-pointer group relative"
                                                            onClick={() => {
                                                                setSelectedImage(wish.file_url!);
                                                                setSelectedImageName(`Wish from ${wish.name}`);
                                                            }}
                                                        >
                                                            <img
                                                                src={wish.file_url}
                                                                alt={`Wish from ${wish.name}`}
                                                                className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+not+available';
                                                                }}
                                                            />

                                                        </div>
                                                    ) : wish.type === 'video' ? (
                                                        <video
                                                            src={wish.file_url}
                                                            controls
                                                            className="w-full h-48 object-cover"
                                                            onError={(e) => {
                                                                console.error('Video failed to load:', wish.file_url);
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                            )}

                                            {/* Message */}
                                            {wish.message && (
                                                <p className="text-gray-700 text-sm mb-3">{wish.message}</p>
                                            )}

                                            {/* Date */}
                                            <p className="text-xs text-gray-400 mb-4">
                                                {new Date(wish.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>

                                            {/* Edit and Delete buttons for each wish */}
                                            <div className="flex gap-3 pt-2 border-t border-pastel-pink/20">
                                                <button
                                                    onClick={() => selectWishToEdit(wish)}
                                                    className="flex-1 py-2 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors hover:bg-pastel-blue/10"
                                                    style={{ borderColor: '#A7C7E7', color: '#A7C7E7' }}
                                                >
                                                    <Edit2 size={18} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(wish.id)}  // Pass the specific wish ID
                                                    className="flex-1 py-2 rounded-lg border-2 border-red-300 text-red-500 flex items-center justify-center gap-2 transition-colors hover:bg-red-50"
                                                >
                                                    <Trash2 size={18} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Send Another Wish Button */}
                            <div className="text-center pt-4 border-t-2 border-pastel-pink/30">
                                <button
                                    onClick={() => {
                                        setStep('form');
                                        setName('');
                                        setMessage('');
                                        setFile(null);
                                        setFilePreview('');
                                        setWishType('text');
                                        setEditing(false);

                                    }}
                                    className="px-8 py-3 bg-pastel-pink text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
                                    style={{ backgroundColor: '#d45673ff' }}
                                >
                                    <span className="text-xl">+</span> Send Another Wish
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    You can send as many wishes as you'd like to Lynda
                                </p>
                            </div>
                        </div>
                    )}



                    {/* Success message but no wish (shouldn't happen, but just in case) */}
                    {step === 'preview' && !myWish && (
                        <div className="text-center py-8">
                            <p className="text-xl text-gray-600">Loading your wish...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}