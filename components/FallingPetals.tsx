'use client';

import { useCallback } from "react";
import type { Container, Engine } from "@tsparticles/engine";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function FallingPetals() {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        console.log("Particles loaded", container);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            className="absolute inset-0 -z-5 pointer-events-none"
            options={{
                fullScreen: { enable: false },
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 60,
                particles: {
                    color: {
                        value: ["#FFD1DC", "#FFB3BA", "#FDD0F9", "#FFFFFF", "#E6E6FA"],
                    },
                    move: {
                        direction: "bottom",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: true,
                        speed: 2,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            width: 1920,
                            height: 1080,
                        },
                        value: 40,
                    },
                    opacity: {
                        value: 0.7,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 1,
                            opacity_min: 0.3,
                            sync: false
                        }
                    },
                    shape: {
                        type: ["circle", "heart", "star"],
                    },
                    size: {
                        value: { min: 5, max: 15 },
                        random: true,
                        anim: {
                            enable: true,
                            speed: 2,
                            size_min: 3,
                            sync: false
                        }
                    },
                    rotate: {
                        value: 0,
                        direction: "clockwise",
                        animation: {
                            enable: true,
                            speed: 5,
                            sync: false
                        }
                    },
                    wobble: {
                        enable: true,
                        distance: 10,
                        speed: 10
                    }
                },
                detectRetina: true,
            }}
        />
    );
}