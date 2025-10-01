"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BackButton } from "@/components/back-button";
import { Input } from "@/components/ui/input";
import { Download, Eraser, Highlighter, Palette, Pencil, Redo, Trash2, Undo } from "lucide-react";

type Tool = "pen" | "highlighter" | "eraser";

export function CanvasContent() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#10b981"); // emerald-500
    const [size, setSize] = useState(4);
    const [history, setHistory] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);

    const CANVAS_STORAGE_KEY = "searnai-canvas";

    const resizeCanvasToWrapper = useCallback(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = wrapper.getBoundingClientRect();

        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor((window.innerHeight - 16 /* header approx */ - rect.top) * dpr);
        canvas.style.width = `${Math.floor(rect.width)}px`;
        canvas.style.height = `${Math.floor(canvas.height / dpr)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctxRef.current = ctx;

        // Re-draw from saved state if available
        const saved = localStorage.getItem(CANVAS_STORAGE_KEY);
        if (saved) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
            };
            img.src = saved;
        } else {
            // background
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#0b0b0b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    useEffect(() => {
        resizeCanvasToWrapper();
        window.addEventListener("resize", resizeCanvasToWrapper);
        return () => window.removeEventListener("resize", resizeCanvasToWrapper);
    }, [resizeCanvasToWrapper]);

    const snapshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.toDataURL("image/png");
        setHistory(prev => [...prev, data]);
        setRedoStack([]);
        try {
            localStorage.setItem(CANVAS_STORAGE_KEY, data);
        } catch {}
    }, []);

    const startDrawing = (x: number, y: number) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        setIsDrawing(true);

        ctx.beginPath();
        ctx.moveTo(x, y);

        if (tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0,1)";
            ctx.lineWidth = size * 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        } else if (tool === "highlighter") {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = color + "33"; // ~20% alpha
            ctx.lineWidth = size * 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    };

    const draw = (x: number, y: number) => {
        const ctx = ctxRef.current;
        if (!ctx || !isDrawing) return;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDrawing = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
        snapshot();
    };

    const getRelativePos = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        const { x, y } = getRelativePos(e);
        startDrawing(x, y);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { x, y } = getRelativePos(e);
        draw(x, y);
    };

    const handlePointerUp = () => {
        if (!isDrawing) return;
        endDrawing();
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const last = history[history.length - 1];
        setRedoStack(prev => [...prev, last]);
        const newHist = history.slice(0, -1);
        setHistory(newHist);

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (newHist.length > 0) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
            img.src = newHist[newHist.length - 1];
            try { localStorage.setItem(CANVAS_STORAGE_KEY, img.src); } catch {}
        } else {
            try { localStorage.removeItem(CANVAS_STORAGE_KEY); } catch {}
        }
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const next = redoStack[redoStack.length - 1];
        setRedoStack(redoStack.slice(0, -1));
        setHistory(prev => [...prev, next]);
        const dpr = window.devicePixelRatio || 1;
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
        img.src = next;
        try { localStorage.setItem(CANVAS_STORAGE_KEY, next); } catch {}
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHistory([]);
        setRedoStack([]);
        try { localStorage.removeItem(CANVAS_STORAGE_KEY); } catch {}
    };

    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `canvas-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Canvas</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={tool === "pen" ? "default" : "outline"} size="sm" onClick={() => setTool("pen")}><Pencil className="h-4 w-4 mr-1"/>Pen</Button>
                    <Button variant={tool === "highlighter" ? "default" : "outline"} size="sm" onClick={() => setTool("highlighter")}><Highlighter className="h-4 w-4 mr-1"/>Highlighter</Button>
                    <Button variant={tool === "eraser" ? "default" : "outline"} size="sm" onClick={() => setTool("eraser")}><Eraser className="h-4 w-4 mr-1"/>Eraser</Button>
                    <div className="hidden md:flex items-center gap-2 ml-2">
                        <Palette className="h-4 w-4" />
                        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-9 p-1" />
                        <Input type="range" min={1} max={24} value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-32" />
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon" onClick={handleUndo}><Undo className="h-5 w-5"/></Button>
                        <Button variant="ghost" size="icon" onClick={handleRedo}><Redo className="h-5 w-5"/></Button>
                        <Button variant="ghost" size="icon" onClick={handleClear}><Trash2 className="h-5 w-5"/></Button>
                        <Button variant="default" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1"/>Export</Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-hidden p-3 md:p-4">
                <div className="mx-auto h-full w-full max-w-6xl">
                    <Card className="h-full">
                        <CardHeader className="py-3">
                            <CardTitle className="text-base">Draw here</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <div ref={wrapperRef} className="relative h-[calc(100vh-12rem)] w-full">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-full rounded-md border bg-card"
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerUp}
                                    onPointerLeave={handlePointerUp}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default CanvasContent;

