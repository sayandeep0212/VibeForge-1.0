'use client';

import React, { useEffect, useRef, useState } from 'react';

const ThreeOverlay = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Delay loading Three.js until the component is in the viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        let animationId: number;
        let renderer: any;
        let cleanedUp = false;

        const init = async () => {
            // Dynamic import to avoid loading Three.js in the initial bundle
            const THREE = await import('three');

            if (cleanedUp || !containerRef.current) return;

            // Scene setup
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            // Cap pixel ratio at 1.5 to reduce GPU workload on high-DPI screens
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            containerRef.current.appendChild(renderer.domElement);

            camera.position.z = 5;

            // Reduce particle count for better performance
            const particlesCount = 120;
            const posArray = new Float32Array(particlesCount * 3);

            for (let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 10;
            }

            const particlesGeometry = new THREE.BufferGeometry();
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.02,
                color: '#fbbf24',
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });

            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);

            // Mouse interaction
            let mouseX = 0;
            let mouseY = 0;

            const handleMouseMove = (event: MouseEvent) => {
                mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
                mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
            };

            window.addEventListener('mousemove', handleMouseMove, { passive: true });

            // Animation Loop — throttled to ~30fps to cut CPU/GPU usage in half
            let lastTime = 0;
            const FPS_INTERVAL = 1000 / 30;

            const animate = (timestamp: number) => {
                animationId = requestAnimationFrame(animate);

                const elapsed = timestamp - lastTime;
                if (elapsed < FPS_INTERVAL) return;
                lastTime = timestamp - (elapsed % FPS_INTERVAL);

                particlesMesh.rotation.y += 0.001;
                particlesMesh.rotation.x += 0.0005;

                particlesMesh.position.x += (mouseX * 0.5 - particlesMesh.position.x) * 0.05;
                particlesMesh.position.y += (-mouseY * 0.5 - particlesMesh.position.y) * 0.05;

                renderer.render(scene, camera);
            };

            animationId = requestAnimationFrame(animate);

            // Handle Resize
            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
            };
        };

        init();

        return () => {
            cleanedUp = true;
            if (animationId) cancelAnimationFrame(animationId);
            if (renderer && containerRef.current) {
                try {
                    containerRef.current.removeChild(renderer.domElement);
                } catch {}
                renderer.dispose();
            }
        };
    }, [isVisible]);

    return <div ref={containerRef} className="fixed inset-0 z-10 pointer-events-none" />;
};

export default ThreeOverlay;
