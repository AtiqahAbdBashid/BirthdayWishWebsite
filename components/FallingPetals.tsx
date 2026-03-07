'use client';

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function FallingPetals() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options: ISourceOptions = useMemo(
        () => ({
            fullScreen: { enable: false },
            background: { color: "transparent" },
            fpsLimit: 60,
            particles: {
                color: {
                    value: ["#FFB7C5", "#FFD1DC", "#FFA5B0", "#FFF0F0", "#FFC0CB"],
                },
                move: {
                    direction: "bottom-right",
                    enable: true,
                    outModes: "out",
                    random: true,
                    speed: 2,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                    },
                    value: 40,
                },
                opacity: {
                    value: 0.7,
                },
                shape: {
                    type: ["circle", "heart"],
                },
                size: {
                    value: { min: 3, max: 8 },
                },
                rotate: {
                    value: 0,
                    animation: {
                        enable: true,
                        speed: 3,
                        sync: false
                    }
                },
            },
            detectRetina: true,
        }),
        [],
    );

    if (!init) {
        return null;
    }

    return (
        <Particles
            id="tsparticles"
            className="fixed inset-0 z-10 pointer-events-none"
            options={options}
        />
    );
}