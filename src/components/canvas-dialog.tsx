"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eraser, Download, Trash2, Palette } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface CanvasDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageDataUrl: string) => void;
}

export function CanvasDialog({ isOpen, onOpenChange, onSave }: CanvasDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState([5]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const { toast } = useToast();

  const colors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080"
  ];

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
      ctx.lineWidth = lineWidth[0];
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `drawing-${Date.now()}.png`;
    a.click();
    toast({ title: "Downloaded!", description: "Your drawing has been saved." });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onOpenChange(false);
    toast({ title: "Saved!", description: "Your drawing has been attached to the chat." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Draw on Canvas</DialogTitle>
          <DialogDescription>
            Create a drawing and attach it to your message or ask AI to analyze it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={tool === "pen" ? "default" : "outline"}
                size="sm"
                onClick={() => setTool("pen")}
              >
                <Palette className="h-4 w-4 mr-2" />
                Pen
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                size="sm"
                onClick={() => setTool("eraser")}
              >
                <Eraser className="h-4 w-4 mr-2" />
                Eraser
              </Button>
            </div>
            
            <div className="flex gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded border-2 ${color === c ? "border-primary" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    setColor(c);
                    setTool("pen");
                  }}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm">Size:</span>
              <Slider
                value={lineWidth}
                onValueChange={setLineWidth}
                min={1}
                max={50}
                step={1}
                className="w-32"
              />
              <span className="text-sm w-8">{lineWidth[0]}</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            
            <Button variant="outline" size="sm" onClick={downloadCanvas}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-border rounded-lg cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Attach to Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
