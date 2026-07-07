'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';

const TOTAL_FRAMES = 193;
const FRAME_FOLDER = '/home-frames';

const ScrollBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Use a ref for images instead of state to avoid re-renders and batching issues
    const imagesRef = useRef<HTMLImageElement[]>(new Array(TOTAL_FRAMES));
    const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);
    const lastRenderedFrameRef = useRef<number>(-1);
    const rafRef = useRef<number>(0);
    const { scrollYProgress } = useScroll();
    
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const frameIndex = useTransform(smoothProgress, [0, 1], [1, TOTAL_FRAMES]);

    const renderFrame = useCallback((index: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imgIndex = Math.floor(index) - 1;

        // Skip re-render if same frame
        if (imgIndex === lastRenderedFrameRef.current) return;

        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: no alpha
        if (!ctx) return;

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

        lastRenderedFrameRef.current = imgIndex;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        // Mobile/Tablet optimization: shift to the right so the subject remains visible
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 768;
        const isTablet = screenWidth >= 768 && screenWidth < 1280;
        const x = isMobile
          ? (canvasWidth - newWidth) * 0.85
          : isTablet
            ? (canvasWidth - newWidth) * 0.7
            : (canvasWidth - newWidth) / 2;
        const y = (canvasHeight - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);
    }, []);

    // Preload strategy: Load first frame immediately, then batch-load others
    useEffect(() => {
        // Load first frame immediately
        const firstImg = new Image();
        firstImg.src = `${FRAME_FOLDER}/ezgif-frame-001.jpg`;
        firstImg.onload = () => {
            imagesRef.current[0] = firstImg;
            setIsFirstFrameLoaded(true);
            renderFrame(1);
        };

        // Load remaining frames in the background using priority batches
        // to avoid blocking main thread and causing jank
        let cancelled = false;

        const loadRemaining = async () => {
            // Load frames in priority batches:
            // 1. Every 10th frame first (scrubbing skeleton)
            // 2. Then fill in the gaps
            const priorityFrames: number[] = [];
            for (let i = 10; i <= TOTAL_FRAMES; i += 10) priorityFrames.push(i);
            
            const remainingFrames: number[] = [];
            for (let i = 2; i <= TOTAL_FRAMES; i++) {
                if (!priorityFrames.includes(i)) remainingFrames.push(i);
            }

            const loadBatch = async (frames: number[]) => {
                for (const i of frames) {
                    if (cancelled) return;
                    
                    // Yield to main thread every 5 frames to prevent jank
                    if (frames.indexOf(i) % 5 === 0) {
                        await new Promise(r => setTimeout(r, 0));
                    }

                    const img = new Image();
                    const frameNum = i.toString().padStart(3, '0');
                    img.src = `${FRAME_FOLDER}/ezgif-frame-${frameNum}.jpg`;
                    img.onload = () => {
                        imagesRef.current[i - 1] = img;
                    };
                }
            };

            // Load priority frames first (every 10th)
            await loadBatch(priorityFrames);
            // Then load remaining frames to fill gaps
            await loadBatch(remainingFrames);
        };

        loadRemaining();

        return () => { cancelled = true; };
    }, [renderFrame]);

    // Update frame on scroll using requestAnimationFrame for debouncing
    useEffect(() => {
        const unsubscribe = frameIndex.on('change', (latest) => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                renderFrame(latest);
            });
        });
        return () => {
            unsubscribe();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [frameIndex, renderFrame]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                lastRenderedFrameRef.current = -1; // Force re-render
                renderFrame(frameIndex.get());
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [frameIndex, renderFrame]);

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
