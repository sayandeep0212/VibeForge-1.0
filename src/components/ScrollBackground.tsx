'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';

const TOTAL_FRAMES = 240;
const FRAME_FOLDER = '/frames';

const ScrollBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);
    const { scrollYProgress } = useScroll();
    
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const frameIndex = useTransform(smoothProgress, [0, 1], [1, TOTAL_FRAMES]);

    // Preload strategy: Load first frame immediately, then others in chunks
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);
        
        // Load first frame immediately
        const firstImg = new Image();
        firstImg.src = `${FRAME_FOLDER}/ezgif-frame-001.jpg`;
        firstImg.onload = () => {
            loadedImages[0] = firstImg;
            setImages([...loadedImages]);
            setIsFirstFrameLoaded(true);
            renderFrame(1, [firstImg]);
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
                    loadedImages[i - 1] = img;
                    // Batch updates to state to avoid excessive re-renders
                    if (i % 20 === 0 || i === TOTAL_FRAMES) {
                        setImages([...loadedImages]);
                    }
                };
            }
        };

        loadRemaining();
    }, []);

    const renderFrame = (index: number, currentImages: HTMLImageElement[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: no alpha
        if (!ctx) return;

        const imgIndex = Math.floor(index) - 1;
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
            renderFrame(latest, images);
        });
        return () => unsubscribe();
    }, [images, frameIndex]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                renderFrame(frameIndex.get(), images);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [images]);

    return (
        <div className="fixed inset-0 z-0 bg-black">
            <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isFirstFrameLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>
    );
};

export default ScrollBackground;
