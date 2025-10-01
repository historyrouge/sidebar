"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Trash2, Download } from "lucide-react";

type DrawingCanvasProps = {
    onChange: (dataUrl: string | null) => void;
    initialImage?: string | null;
    height?: number;
};

export function DrawingCanvas({ onChange, initialImage = null, height = 240 }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState<string>("#ffffff");
    const [strokeWidth, setStrokeWidth] = useState<number>(3);
    const [bgColor, setBgColor] = useState<string>("transparent");

    // Resize canvas to container width for crisp drawing
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const dpr = window.devicePixelRatio || 1;
        const width = container.clientWidth;
        const cssHeight = height;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${cssHeight}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            if (bgColor !== 'transparent') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, width, cssHeight);
            }
            if (initialImage) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, cssHeight);
                };
                img.src = initialImage;
            }
        }
    }, [height, bgColor, initialImage]);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    const getContext = () => canvasRef.current?.getContext('2d');

    const getRelativePos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const point = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
        const x = point.clientX - rect.left;
        const y = point.clientY - rect.top;
        return { x, y };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const ctx = getContext();
        if (!ctx) return;
        const { x, y } = getRelativePos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = getContext();
        if (!ctx) return;
        const { x, y } = getRelativePos(e);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        getContext()?.closePath();
        const data = canvasRef.current?.toDataURL('image/png') || null;
        onChange(data);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onChange(null);
    };

    const handleDownload = () => {
        const data = canvasRef.current?.toDataURL('image/png');
        if (!data) return;
        const a = document.createElement('a');
        a.href = data;
        a.download = 'canvas.png';
        a.click();
    };

    return (
        <div className="w-full" ref={containerRef}>
            <div className="flex items-center gap-2 mb-2">
                <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} aria-label="Pen color" />
                <input type="range" min={1} max={16} value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} aria-label="Pen width" />
                <Button type="button" variant="outline" size="sm" onClick={() => setBgColor(bgColor === 'transparent' ? '#000000' : 'transparent')}>
                    <Eraser className="h-4 w-4 mr-1" /> BG
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                    <Trash2 className="h-4 w-4 mr-1" /> Clear
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> Download
                </Button>
            </div>
            <canvas
                ref={canvasRef}
                className="w-full border rounded-md bg-transparent touch-none select-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
            />
        </div>
    );
}

