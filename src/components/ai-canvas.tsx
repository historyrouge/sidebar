"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Code, 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  Undo, 
  Redo,
  Save,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  Move,
  Square,
  Circle,
  Triangle,
  Pen,
  Eraser,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Grid,
  Ruler,
  Zap,
  Wand2,
  Sparkles,
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Map,
  Network,
  Workflow,
  GitBranch,
  Boxes,
  Component
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';

interface CanvasElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'code' | 'diagram' | 'chart' | 'mindmap';
  x: number;
  y: number;
  width: number;
  height: number;
  content: any;
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
  };
  locked: boolean;
  visible: boolean;
  layer: number;
}

interface CanvasProject {
  id: string;
  name: string;
  elements: CanvasElement[];
  background: string;
  dimensions: { width: number; height: number };
  createdAt: Date;
  updatedAt: Date;
}

interface AICanvasProps {
  onAIGenerate?: (prompt: string, type: string) => Promise<any>;
  className?: string;
}

export function AICanvas({ onAIGenerate, className = '' }: AICanvasProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [project, setProject] = useState<CanvasProject>({
    id: '1',
    name: 'Untitled Canvas',
    elements: [],
    background: '#ffffff',
    dimensions: { width: 1200, height: 800 },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [history, setHistory] = useState<CanvasProject[]>([project]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Drawing state
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');

  const tools = [
    { id: 'select', icon: Move, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
  ];

  const aiGenerationTypes = [
    { id: 'diagram', icon: Workflow, label: 'Diagram', description: 'Generate flowcharts, process diagrams' },
    { id: 'mindmap', icon: Network, label: 'Mind Map', description: 'Create mind maps and concept maps' },
    { id: 'chart', icon: BarChart3, label: 'Chart', description: 'Generate data visualizations' },
    { id: 'infographic', icon: TrendingUp, label: 'Infographic', description: 'Create visual information graphics' },
    { id: 'wireframe', icon: Component, label: 'Wireframe', description: 'Generate UI/UX wireframes' },
    { id: 'timeline', icon: GitBranch, label: 'Timeline', description: 'Create project timelines' },
    { id: 'organizational', icon: Boxes, label: 'Org Chart', description: 'Generate organizational charts' },
    { id: 'presentation', icon: Target, label: 'Presentation', description: 'Create presentation slides' }
  ];

  const addToHistory = useCallback((newProject: CanvasProject) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...newProject, updatedAt: new Date() });
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setProject(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setProject(history[historyIndex + 1]);
    }
  };

  const addElement = (element: Omit<CanvasElement, 'id' | 'layer'>) => {
    const newElement: CanvasElement = {
      ...element,
      id: Date.now().toString(),
      layer: project.elements.length
    };
    
    const newProject = {
      ...project,
      elements: [...project.elements, newElement]
    };
    
    setProject(newProject);
    addToHistory(newProject);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const newProject = {
      ...project,
      elements: project.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    };
    
    setProject(newProject);
    addToHistory(newProject);
  };

  const deleteElement = (id: string) => {
    const newProject = {
      ...project,
      elements: project.elements.filter(el => el.id !== id)
    };
    
    setProject(newProject);
    addToHistory(newProject);
    setSelectedElement(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (selectedTool === 'text') {
      addElement({
        type: 'text',
        x,
        y,
        width: 200,
        height: 50,
        content: 'Double click to edit',
        style: {
          fontSize: 16,
          color: '#000000',
          fontFamily: 'Arial'
        },
        locked: false,
        visible: true
      });
    } else if (selectedTool === 'rectangle') {
      addElement({
        type: 'shape',
        x,
        y,
        width: 100,
        height: 60,
        content: { shape: 'rectangle' },
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: 2
        },
        locked: false,
        visible: true
      });
    } else if (selectedTool === 'circle') {
      addElement({
        type: 'shape',
        x,
        y,
        width: 80,
        height: 80,
        content: { shape: 'circle' },
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: 2
        },
        locked: false,
        visible: true
      });
    }
  };

  const generateWithAI = async (type: string) => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for AI generation",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await onAIGenerate?.(aiPrompt, type);
      
      // Add generated content to canvas
      addElement({
        type: 'diagram',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        content: { 
          type, 
          data: result,
          prompt: aiPrompt 
        },
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          borderRadius: 8
        },
        locked: false,
        visible: true
      });

      toast({
        title: "AI Generation Complete",
        description: `Generated ${type} added to canvas`
      });
      
      setAiPrompt('');
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content with AI",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCanvas = (format: 'png' | 'svg' | 'json') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${project.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (format === 'json') {
      const dataStr = JSON.stringify(project, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.download = `${project.name}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Export Complete",
      description: `Canvas exported as ${format.toUpperCase()}`
    });
  };

  const clearCanvas = () => {
    const newProject = {
      ...project,
      elements: []
    };
    setProject(newProject);
    addToHistory(newProject);
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = project.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 20;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw elements
    project.elements
      .filter(el => el.visible)
      .sort((a, b) => a.layer - b.layer)
      .forEach(element => {
        ctx.save();
        ctx.globalAlpha = element.style.opacity || 1;

        if (element.type === 'text') {
          ctx.fillStyle = element.style.color || '#000000';
          ctx.font = `${element.style.fontSize || 16}px ${element.style.fontFamily || 'Arial'}`;
          ctx.fillText(element.content, element.x, element.y + (element.style.fontSize || 16));
        } else if (element.type === 'shape') {
          ctx.fillStyle = element.style.backgroundColor || '#ffffff';
          ctx.strokeStyle = element.style.borderColor || '#000000';
          ctx.lineWidth = element.style.borderWidth || 1;

          if (element.content.shape === 'rectangle') {
            ctx.fillRect(element.x, element.y, element.width, element.height);
            ctx.strokeRect(element.x, element.y, element.width, element.height);
          } else if (element.content.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(
              element.x + element.width / 2, 
              element.y + element.height / 2, 
              element.width / 2, 
              0, 
              2 * Math.PI
            );
            ctx.fill();
            ctx.stroke();
          }
        }

        // Draw selection outline
        if (selectedElement === element.id) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
          ctx.setLineDash([]);
        }

        ctx.restore();
      });
  }, [project, selectedElement, showGrid]);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Left Sidebar - Tools */}
      <div className="w-16 border-r bg-muted/20 flex flex-col items-center py-4 gap-2">
        {tools.map(tool => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => setSelectedTool(tool.id)}
            title={tool.label}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        ))}
        
        <Separator className="my-2" />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
        >
          <Grid className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => setShowRuler(!showRuler)}
          title="Toggle Ruler"
        >
          <Ruler className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b bg-background p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="w-48 h-8"
            />
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex === 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex === history.length - 1}>
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCanvas}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Zoom:</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(400, zoom + 25))}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setZoom(100)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportCanvas('png')}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportCanvas('svg')}>
                  Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportCanvas('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-auto bg-muted/10" ref={containerRef}>
          <div 
            className="relative"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: project.dimensions.width,
              height: project.dimensions.height
            }}
          >
            <canvas
              ref={canvasRef}
              width={project.dimensions.width}
              height={project.dimensions.height}
              className="border bg-white cursor-crosshair"
              onClick={handleCanvasClick}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties & AI */}
      <div className="w-80 border-l bg-muted/20">
        <Tabs defaultValue="ai" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai" className="h-full p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generation
              </h3>
              <Textarea
                placeholder="Describe what you want to create..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mb-3"
                rows={3}
              />
              
              <div className="grid grid-cols-2 gap-2">
                {aiGenerationTypes.map(type => (
                  <Button
                    key={type.id}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 flex flex-col items-center gap-1"
                    onClick={() => generateWithAI(type.id)}
                    disabled={isGenerating || !aiPrompt.trim()}
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
              
              {isGenerating && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm">Generating...</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Smart Layout
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Suggest Improvements
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Color Harmony
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layers" className="h-full p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Layers</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="h-64">
                {project.elements.map(element => (
                  <div
                    key={element.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                      selectedElement === element.id ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(element.id, { visible: !element.visible });
                      }}
                    >
                      {element.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(element.id, { locked: !element.locked });
                      }}
                    >
                      {element.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    </Button>
                    
                    <span className="flex-1 text-sm truncate">
                      {element.type} {element.id.slice(-4)}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="h-full p-4">
            {selectedElement ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Element Properties</h3>
                {/* Properties panel would go here */}
                <div className="text-sm text-muted-foreground">
                  Properties for selected element
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Component className="h-8 w-8 mx-auto mb-2" />
                <p>Select an element to edit properties</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}