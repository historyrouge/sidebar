"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  Download, 
  Upload, 
  Copy, 
  Save, 
  Trash2,
  FileText,
  Terminal,
  Code,
  Zap,
  Bug,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MemoryStick,
  Cpu,
  HardDrive,
  Network,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Settings,
  Package,
  Database,
  Globe,
  Image as ImageIcon,
  BarChart3,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  isMain: boolean;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  warnings: string[];
  returnValue?: any;
}

interface CodeExecutorProps {
  onCodeChange?: (code: string, language: string) => void;
  onExecutionComplete?: (result: ExecutionResult) => void;
  initialCode?: string;
  initialLanguage?: string;
  className?: string;
}

const supportedLanguages = [
  { id: 'python', name: 'Python', icon: '🐍', extensions: ['.py'] },
  { id: 'javascript', name: 'JavaScript', icon: '🟨', extensions: ['.js'] },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', extensions: ['.ts'] },
  { id: 'html', name: 'HTML', icon: '🌐', extensions: ['.html'] },
  { id: 'css', name: 'CSS', icon: '🎨', extensions: ['.css'] },
  { id: 'sql', name: 'SQL', icon: '🗃️', extensions: ['.sql'] },
  { id: 'bash', name: 'Bash', icon: '💻', extensions: ['.sh'] },
  { id: 'json', name: 'JSON', icon: '📄', extensions: ['.json'] },
  { id: 'markdown', name: 'Markdown', icon: '📝', extensions: ['.md'] },
  { id: 'yaml', name: 'YAML', icon: '⚙️', extensions: ['.yml', '.yaml'] }
];

const codeTemplates = {
  python: `# Python Code Example
import numpy as np
import matplotlib.pyplot as plt

def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

# Generate and display Fibonacci sequence
n_terms = 10
fib_sequence = fibonacci(n_terms)
print(f"Fibonacci sequence ({n_terms} terms): {fib_sequence}")

# Create a simple plot
x = range(len(fib_sequence))
plt.figure(figsize=(10, 6))
plt.plot(x, fib_sequence, 'bo-')
plt.title('Fibonacci Sequence')
plt.xlabel('Index')
plt.ylabel('Value')
plt.grid(True)
plt.show()`,

  javascript: `// JavaScript Code Example
class DataProcessor {
    constructor(data) {
        this.data = data;
    }
    
    filter(predicate) {
        return new DataProcessor(this.data.filter(predicate));
    }
    
    map(transform) {
        return new DataProcessor(this.data.map(transform));
    }
    
    reduce(reducer, initialValue) {
        return this.data.reduce(reducer, initialValue);
    }
    
    get result() {
        return this.data;
    }
}

// Example usage
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const processor = new DataProcessor(numbers);

const evenSquares = processor
    .filter(n => n % 2 === 0)
    .map(n => n * n)
    .result;

console.log('Original numbers:', numbers);
console.log('Even squares:', evenSquares);

// Calculate statistics
const sum = evenSquares.reduce((a, b) => a + b, 0);
const average = sum / evenSquares.length;

console.log('Sum:', sum);
console.log('Average:', average);`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Web Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .btn {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .btn:hover {
            background: #45a049;
        }
        #output {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            min-height: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Interactive Demo</h1>
        <p>Click the buttons to see dynamic content!</p>
        
        <button class="btn" onclick="showTime()">Show Current Time</button>
        <button class="btn" onclick="generateRandom()">Random Number</button>
        <button class="btn" onclick="createChart()">Create Chart</button>
        
        <div id="output">
            <p>Output will appear here...</p>
        </div>
    </div>

    <script>
        function showTime() {
            const now = new Date();
            document.getElementById('output').innerHTML = 
                '<h3>Current Time</h3><p>' + now.toLocaleString() + '</p>';
        }
        
        function generateRandom() {
            const random = Math.floor(Math.random() * 1000) + 1;
            document.getElementById('output').innerHTML = 
                '<h3>Random Number</h3><p style="font-size: 2em; color: #4CAF50;">' + random + '</p>';
        }
        
        function createChart() {
            const data = Array.from({length: 10}, () => Math.floor(Math.random() * 100));
            let chart = '<h3>Data Visualization</h3><div style="display: flex; align-items: end; height: 200px;">';
            
            data.forEach((value, index) => {
                chart += '<div style="width: 30px; height: ' + (value * 2) + 'px; background: #4CAF50; margin: 2px; display: flex; align-items: end; justify-content: center; color: white; font-size: 12px;">' + value + '</div>';
            });
            
            chart += '</div>';
            document.getElementById('output').innerHTML = chart;
        }
    </script>
</body>
</html>`,

  sql: `-- SQL Query Examples
-- Create sample tables
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    salary REAL,
    hire_date DATE
);

CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    budget REAL
);

-- Insert sample data
INSERT OR REPLACE INTO departments VALUES 
(1, 'Engineering', 1000000),
(2, 'Marketing', 500000),
(3, 'Sales', 750000);

INSERT OR REPLACE INTO employees VALUES 
(1, 'Alice Johnson', 'Engineering', 95000, '2022-01-15'),
(2, 'Bob Smith', 'Marketing', 65000, '2021-03-20'),
(3, 'Carol Davis', 'Engineering', 105000, '2020-07-10'),
(4, 'David Wilson', 'Sales', 75000, '2023-02-01'),
(5, 'Eva Brown', 'Engineering', 88000, '2022-11-30');

-- Complex queries
SELECT 
    d.name as department,
    COUNT(e.id) as employee_count,
    AVG(e.salary) as avg_salary,
    MAX(e.salary) as max_salary,
    MIN(e.salary) as min_salary
FROM departments d
LEFT JOIN employees e ON d.name = e.department
GROUP BY d.name
ORDER BY avg_salary DESC;

-- Find top earners by department
WITH ranked_employees AS (
    SELECT 
        name,
        department,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank
    FROM employees
)
SELECT * FROM ranked_employees WHERE rank <= 2;`
};

export function CodeExecutor({ 
  onCodeChange, 
  onExecutionComplete, 
  initialCode = '', 
  initialLanguage = 'python',
  className = '' 
}: CodeExecutorProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: `main.${supportedLanguages.find(l => l.id === initialLanguage)?.extensions[0] || '.py'}`,
      language: initialLanguage,
      content: initialCode || codeTemplates[initialLanguage as keyof typeof codeTemplates] || '',
      isMain: true
    }
  ]);
  
  const [activeFileId, setActiveFileId] = useState('1');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [showOutput, setShowOutput] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [installedPackages, setInstalledPackages] = useState<string[]>(['numpy', 'matplotlib', 'pandas']);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFile = files.find(f => f.id === activeFileId);

  const updateFileContent = (content: string) => {
    setFiles(prev => prev.map(f => 
      f.id === activeFileId ? { ...f, content } : f
    ));
    
    if (activeFile) {
      onCodeChange?.(content, activeFile.language);
    }
  };

  const addNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: 'untitled.py',
      language: 'python',
      content: '',
      isMain: false
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const deleteFile = (fileId: string) => {
    if (files.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "At least one file must remain",
        variant: "destructive"
      });
      return;
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    if (activeFileId === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles[0].id);
    }
  };

  const executeCode = async () => {
    if (!activeFile) return;
    
    setIsExecuting(true);
    setExecutionProgress(0);
    
    // Simulate execution progress
    const progressInterval = setInterval(() => {
      setExecutionProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: ExecutionResult = {
        success: true,
        output: generateMockOutput(activeFile.language, activeFile.content),
        executionTime: Math.random() * 1000 + 100,
        memoryUsage: Math.random() * 50 + 10,
        warnings: Math.random() > 0.7 ? ['Unused variable detected'] : [],
        returnValue: activeFile.language === 'python' ? 'Function executed successfully' : undefined
      };
      
      setExecutionResult(result);
      onExecutionComplete?.(result);
      
      toast({
        title: "Execution Complete",
        description: `Code executed successfully in ${result.executionTime.toFixed(0)}ms`
      });
      
    } catch (error: any) {
      const result: ExecutionResult = {
        success: false,
        output: '',
        error: error.message || 'Execution failed',
        executionTime: 0,
        memoryUsage: 0,
        warnings: []
      };
      
      setExecutionResult(result);
      onExecutionComplete?.(result);
      
      toast({
        title: "Execution Failed",
        description: error.message || 'An error occurred during execution',
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setExecutionProgress(100);
      setIsExecuting(false);
    }
  };

  const generateMockOutput = (language: string, code: string): string => {
    switch (language) {
      case 'python':
        if (code.includes('fibonacci')) {
          return `Fibonacci sequence (10 terms): [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
[Plot displayed: Fibonacci Sequence graph]`;
        }
        return `Python 3.9.0
>>> print("Hello, World!")
Hello, World!
>>> 2 + 2
4
>>> import numpy as np
>>> np.array([1, 2, 3, 4, 5]).mean()
3.0`;
        
      case 'javascript':
        if (code.includes('DataProcessor')) {
          return `Original numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Even squares: [4, 16, 36, 64, 100]
Sum: 220
Average: 44`;
        }
        return `> console.log("Hello, World!")
Hello, World!
> [1, 2, 3].map(x => x * 2)
[2, 4, 6]`;
        
      case 'html':
        return `[HTML Preview]
Interactive Web Page rendered successfully
- Time display functionality: ✓
- Random number generator: ✓
- Dynamic chart creation: ✓`;
        
      case 'sql':
        return `Query executed successfully.

department    | employee_count | avg_salary | max_salary | min_salary
Engineering   | 3              | 96000.00   | 105000.00  | 88000.00
Sales         | 1              | 75000.00   | 75000.00   | 75000.00
Marketing     | 1              | 65000.00   | 65000.00   | 65000.00

Top earners by department:
name          | department   | salary    | rank
Carol Davis   | Engineering  | 105000.00 | 1
Alice Johnson | Engineering  | 95000.00  | 2
David Wilson  | Sales        | 75000.00  | 1
Bob Smith     | Marketing    | 65000.00  | 1`;
        
      default:
        return `Code executed successfully.
Output: ${code.substring(0, 100)}...`;
    }
  };

  const downloadFile = () => {
    if (!activeFile) return;
    
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File Downloaded",
      description: `${activeFile.name} has been downloaded`
    });
  };

  const uploadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const extension = file.name.split('.').pop()?.toLowerCase();
      const language = supportedLanguages.find(l => 
        l.extensions.some(ext => ext === `.${extension}`)
      )?.id || 'text';
      
      const newFile: CodeFile = {
        id: Date.now().toString(),
        name: file.name,
        language,
        content,
        isMain: false
      };
      
      setFiles(prev => [...prev, newFile]);
      setActiveFileId(newFile.id);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully`
      });
    };
    
    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      toast({
        title: "Copied",
        description: "Code copied to clipboard"
      });
    }
  };

  const installPackage = (packageName: string) => {
    if (!installedPackages.includes(packageName)) {
      setInstalledPackages(prev => [...prev, packageName]);
      toast({
        title: "Package Installed",
        description: `${packageName} has been installed`
      });
    }
  };

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Executor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOutput(!showOutput)}
            >
              {showOutput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 border-b">
          <div className="flex-1 flex items-center gap-1 overflow-x-auto">
            {files.map(file => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-t-lg cursor-pointer min-w-0 max-w-48 ${
                  activeFileId === file.id 
                    ? 'bg-background border border-b-0' 
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <span className="text-xs">
                  {supportedLanguages.find(l => l.id === file.language)?.icon || '📄'}
                </span>
                <div className="flex-1 truncate text-sm">{file.name}</div>
                {files.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={addNewFile}>
            <FileText className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={activeFile?.language}
              onValueChange={(language) => {
                if (activeFile) {
                  setFiles(prev => prev.map(f => 
                    f.id === activeFileId ? { ...f, language } : f
                  ));
                }
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang.id} value={lang.id}>
                    <span className="flex items-center gap-2">
                      <span>{lang.icon}</span>
                      {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={uploadFile}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            
            <Button variant="outline" size="sm" onClick={downloadFile}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isExecuting && (
              <div className="flex items-center gap-2">
                <Progress value={executionProgress} className="w-20" />
                <span className="text-xs text-muted-foreground">{executionProgress}%</span>
              </div>
            )}
            
            <Button
              onClick={executeCode}
              disabled={isExecuting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExecuting ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className={`flex ${showOutput ? 'h-96' : 'h-64'}`}>
          {/* Code Editor */}
          <div className="flex-1 border-r">
            <Textarea
              value={activeFile?.content || ''}
              onChange={(e) => updateFileContent(e.target.value)}
              className="h-full resize-none border-0 rounded-none font-mono text-sm"
              placeholder="Enter your code here..."
            />
          </div>

          {/* Output Panel */}
          {showOutput && (
            <div className="w-1/2">
              <Tabs defaultValue="output" className="h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="console">Console</TabsTrigger>
                  <TabsTrigger value="packages">Packages</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="output" className="h-full p-4">
                  <ScrollArea className="h-full">
                    {executionResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {executionResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-semibold">
                            {executionResult.success ? 'Execution Successful' : 'Execution Failed'}
                          </span>
                        </div>
                        
                        {executionResult.output && (
                          <div className="bg-muted/50 p-3 rounded font-mono text-sm whitespace-pre-wrap">
                            {executionResult.output}
                          </div>
                        )}
                        
                        {executionResult.error && (
                          <div className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                              <Bug className="h-4 w-4" />
                              <span className="font-semibold">Error</span>
                            </div>
                            <pre className="text-sm text-red-700 dark:text-red-300">
                              {executionResult.error}
                            </pre>
                          </div>
                        )}
                        
                        {executionResult.warnings.length > 0 && (
                          <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-semibold">Warnings</span>
                            </div>
                            {executionResult.warnings.map((warning, index) => (
                              <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                                {warning}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Terminal className="h-8 w-8 mx-auto mb-2" />
                        <p>Run your code to see the output</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="console" className="h-full p-4">
                  <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-full overflow-auto">
                    <div>$ Code Executor Console</div>
                    <div>Ready for execution...</div>
                    {executionResult && (
                      <div className="mt-2">
                        <div>$ Execution completed</div>
                        <div>Time: {executionResult.executionTime.toFixed(0)}ms</div>
                        <div>Memory: {executionResult.memoryUsage.toFixed(1)}MB</div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="packages" className="h-full p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Installed Packages</h3>
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {installedPackages.map(pkg => (
                        <div key={pkg} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{pkg}</span>
                          <Badge variant="secondary">installed</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="h-full p-4">
                  {executionResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Execution Time</div>
                            <div className="font-semibold">{executionResult.executionTime.toFixed(0)}ms</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MemoryStick className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Memory Usage</div>
                            <div className="font-semibold">{executionResult.memoryUsage.toFixed(1)}MB</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-purple-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">CPU Usage</div>
                            <div className="font-semibold">{Math.floor(Math.random() * 50 + 10)}%</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-orange-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Disk I/O</div>
                            <div className="font-semibold">{Math.floor(Math.random() * 100)}KB</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p>Run code to see execution statistics</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".py,.js,.ts,.html,.css,.sql,.sh,.json,.md,.yml,.yaml,.txt"
      />
    </Card>
  );
}