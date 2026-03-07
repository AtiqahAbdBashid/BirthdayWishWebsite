'use client';

import { useEffect, useRef } from 'react';

export default function PetalsEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Petal class
        class Petal {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            rotation: number;
            rotationSpeed: number;
            color: string;
            opacity: number;

            constructor(canvasWidth: number) {
                this.x = Math.random() * canvasWidth;
                this.y = -Math.random() * 200;
                this.size = 4 + Math.random() * 8;
                // SLOWER SPEEDS - reduced by about 40%
                this.speedX = -0.6 + Math.random() * 1.2;  // Was: -1 to 1
                this.speedY = 0.4 + Math.random() * 0.8;   // Was: 1 to 2
                this.rotation = Math.random() * 360;
                this.rotationSpeed = -1 + Math.random() * 2; // Was: -2 to 2

                // Petal colors - soft pinks and whites
                const colors = [
                    '#FFB7C5', '#FFD1DC', '#FFA5B0',
                    '#FFF0F0', '#FFC0CB', '#FADADD'
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = 0.5 + Math.random() * 0.3;
            }

            update(canvasWidth: number, canvasHeight: number) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;

                // Reset if off screen
                if (this.y > canvasHeight + 50) {
                    this.y = -50;
                    this.x = Math.random() * canvasWidth;
                }
                if (this.x > canvasWidth + 50) this.x = -50;
                if (this.x < -50) this.x = canvasWidth + 50;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;

                // Draw petal shape
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // Create petals
        const petals: Petal[] = [];
        const petalCount = 50; // Slightly fewer for a more sparse, elegant look
        for (let i = 0; i < petalCount; i++) {
            petals.push(new Petal(canvas.width));
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            petals.forEach(petal => {
                petal.update(canvas.width, canvas.height);
                petal.draw(ctx);
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-10"
            style={{ display: 'block' }}
        />
    );
}