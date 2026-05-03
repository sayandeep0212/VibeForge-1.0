'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';

const TOTAL_FRAMES = 240;
const FRAME_FOLDER = '/frames';

const ScrollBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Use a ref for images instead of state to avoid re-renders and batching issues
    const imagesRef = useRef<HTMLImageElement[]>(new Array(TOTAL_FRAMES));
    const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);
    const { scrollYProgress } = useScroll();
    
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const frameIndex = useTransform(smoothProgress, [0, 1], [1, TOTAL_FRAMES]);

    // Preload strategy: Load first frame immediately, then others
    useEffect(() => {
        // Load first frame immediately
        const firstImg = new Image();
        firstImg.src = `${FRAME_FOLDER}/ezgif-frame-001.jpg`;
        firstImg.onload = () => {
            imagesRef.current[0] = firstImg;
            setIsFirstFrameLoaded(true);
            renderFrame(1);
        };

        // Load remaining frames in the background
        const loadRemaining = async () => {
            for (let i = 2; i <= TOTAL_FRAMES; i++) {
                // Small delay to avoid blocking the main thread
                if (i % 20 === 0) await new Promise(r => setTimeout(r, 10));
                
                const img = new Image();
                const frameNum = i.toString().padStart(3, '0');
                img.src = `${FRAME_FOLDER}/ezgif-frame-${frameNum}.jpg`;
                img.onload = () => {
                    imagesRef.current[i - 1] = img;
                    // Force a render if we are currently at this frame or if it's the currently closest available
                    renderFrame(frameIndex.get());
                };
            }
        };

        loadRemaining();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: no alpha
        if (!ctx) return;

        const imgIndex = Math.floor(index) - 1;
        const currentImages = imagesRef.current;
        
        // Fallback logic: if requested image isn't loaded, find the closest available one
        let img = currentImages[imgIndex];
        if (!img) {
            // Find closest previous frame
            for (let i = imgIndex; i >= 0; i--) {
                if (currentImages[i]) {
                    img = currentImages[i];
                    break;
                }
            }
        }
        
        if (!img) return;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        const x = (canvasWidth - newWidth) / 2;
        const y = (canvasHeight - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);
    };

    // Update frame on scroll
    useEffect(() => {
        const unsubscribe = frameIndex.on('change', (latest) => {
            renderFrame(latest);
        });
        return () => unsubscribe();
    }, [frameIndex]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                renderFrame(frameIndex.get());
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [frameIndex]);

    return (
        <div className="fixed inset-0 z-0 bg-black">
            <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isFirstFrameLoaded ? 'opacity-100' : 'opacity-0'}`}
            />

        </div>
    );
};

export default ScrollBackground;
