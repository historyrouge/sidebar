"use client";

import { useEffect, useRef, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Eraser, Pen, RotateCcw, Type } from "lucide-react";

export function CanvasBoard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState("#22c55e");
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const resize = () => {
            const rect = container.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;
            canvas.width = Math.floor(rect.width * ratio);
            canvas.height = Math.floor((window.innerHeight - 64) * ratio);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${window.innerHeight - 64}px`;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(ratio, ratio);
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const getContext = () => canvasRef.current?.getContext('2d')!;

    const getPos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const ctx = getContext();
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const ctx = getContext();
        const { x, y } = getPos(e);
        ctx.strokeStyle = tool === 'pen' ? strokeColor : '#ffffff';
        ctx.lineWidth = tool === 'pen' ? strokeWidth : 24;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handlePointerUp = () => {
        if (!isDrawing) return;
        const ctx = getContext();
        ctx.closePath();
        setIsDrawing(false);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'canvas.png';
        a.click();
    };

    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-xl font-semibold tracking-tight">Canvas</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={tool === 'pen' ? 'default' : 'outline'} size="sm" onClick={() => setTool('pen')} className="gap-2"><Pen className="h-4 w-4" /> Pen</Button>
                    <Button variant={tool === 'eraser' ? 'default' : 'outline'} size="sm" onClick={() => setTool('eraser')} className="gap-2"><Eraser className="h-4 w-4" /> Erase</Button>
                    <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="h-8 w-10 rounded cursor-pointer" aria-label="Color" />
                    <Input type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Math.max(1, Number(e.target.value)))} className="w-20" />
                    <Button variant="outline" size="sm" onClick={handleClear} className="gap-2"><RotateCcw className="h-4 w-4" /> Clear</Button>
                    <Button variant="default" size="sm" onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" /> Download</Button>
                </div>
            </header>
            <main className="flex-1 bg-muted" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                />
            </main>
        </div>
    );
}

