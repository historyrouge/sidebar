"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Download, 
  Upload, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Edit,
  Save,
  FileSpreadsheet,
  Database,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Calculator,
  Zap,
  Brain,
  Target,
  Layers,
  Grid,
  Map,
  Network,
  Scatter,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ScatterChart,
  Scatter as RechartsScatter,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';

interface DataPoint {
  [key: string]: any;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | 'composed';
  title: string;
  xAxis?: string;
  yAxis?: string;
  dataKey?: string;
  colors: string[];
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
}

interface DataVisualizerProps {
  initialData?: DataPoint[];
  onDataAnalysis?: (analysis: any) => void;
  className?: string;
}

const chartTypes = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
  { id: 'scatter', name: 'Scatter Plot', icon: Scatter },
  { id: 'area', name: 'Area Chart', icon: Activity },
  { id: 'radar', name: 'Radar Chart', icon: Target },
  { id: 'composed', name: 'Composed Chart', icon: Layers }
];

const colorPalettes = [
  ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'],
  ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8DD1E1'],
  ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
  ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316'],
  ['#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB']
];

const sampleDatasets = {
  sales: [
    { month: 'Jan', sales: 4000, expenses: 2400, profit: 1600 },
    { month: 'Feb', sales: 3000, expenses: 1398, profit: 1602 },
    { month: 'Mar', sales: 2000, expenses: 9800, profit: -7800 },
    { month: 'Apr', sales: 2780, expenses: 3908, profit: -1128 },
    { month: 'May', sales: 1890, expenses: 4800, profit: -2910 },
    { month: 'Jun', sales: 2390, expenses: 3800, profit: -1410 }
  ],
  performance: [
    { subject: 'Math', A: 120, B: 110, fullMark: 150 },
    { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
    { subject: 'English', A: 86, B: 130, fullMark: 150 },
    { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
    { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
    { subject: 'History', A: 65, B: 85, fullMark: 150 }
  ],
  demographics: [
    { name: '18-24', value: 400, color: '#0088FE' },
    { name: '25-34', value: 300, color: '#00C49F' },
    { name: '35-44', value: 300, color: '#FFBB28' },
    { name: '45-54', value: 200, color: '#FF8042' },
    { name: '55+', value: 100, color: '#8DD1E1' }
  ]
};

export function DataVisualizer({ 
  initialData = [], 
  onDataAnalysis, 
  className = '' 
}: DataVisualizerProps) {
  const { toast } = useToast();
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    title: 'Data Visualization',
    xAxis: '',
    yAxis: '',
    dataKey: '',
    colors: colorPalettes[0],
    showGrid: true,
    showLegend: true,
    showTooltip: true
  });
  
  const [rawData, setRawData] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      if (!chartConfig.xAxis && keys.length > 0) {
        setChartConfig(prev => ({
          ...prev,
          xAxis: keys[0],
          yAxis: keys[1] || keys[0],
          dataKey: keys[1] || keys[0]
        }));
      }
    }
  }, [data, chartConfig.xAxis]);

  const loadSampleDataset = (datasetKey: string) => {
    const dataset = sampleDatasets[datasetKey as keyof typeof sampleDatasets];
    if (dataset) {
      setData(dataset);
      setRawData(JSON.stringify(dataset, null, 2));
      setSelectedDataset(datasetKey);
      toast({
        title: "Dataset Loaded",
        description: `${datasetKey} dataset loaded successfully`
      });
    }
  };

  const parseRawData = () => {
    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        setData(parsed);
        toast({
          title: "Data Parsed",
          description: "Data has been parsed and loaded successfully"
        });
      } else {
        throw new Error("Data must be an array of objects");
      }
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message || "Failed to parse data",
        variant: "destructive"
      });
    }
  };

  const generateAnalysis = async () => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "Please load data first",
        variant: "destructive"
      });
      return;
    }

    // Generate basic statistical analysis
    const numericColumns = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    );

    const stats = numericColumns.map(column => {
      const values = data.map(row => row[column]).filter(val => typeof val === 'number');
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const sortedValues = [...values].sort((a, b) => a - b);
      const median = sortedValues[Math.floor(sortedValues.length / 2)];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      return {
        column,
        count: values.length,
        sum,
        mean: Number(mean.toFixed(2)),
        median,
        min,
        max,
        stdDev: Number(stdDev.toFixed(2)),
        variance: Number(variance.toFixed(2))
      };
    });

    const analysisResult = {
      totalRows: data.length,
      columns: Object.keys(data[0]),
      numericColumns,
      statistics: stats,
      insights: generateInsights(stats, data)
    };

    setAnalysis(analysisResult);
    onDataAnalysis?.(analysisResult);

    toast({
      title: "Analysis Complete",
      description: "Data analysis has been generated"
    });
  };

  const generateInsights = (stats: any[], data: DataPoint[]) => {
    const insights = [];
    
    // Find the column with highest variance
    const highestVariance = stats.reduce((prev, current) => 
      prev.variance > current.variance ? prev : current
    );
    insights.push(`${highestVariance.column} shows the highest variability (σ = ${highestVariance.stdDev})`);

    // Find correlations (simplified)
    if (stats.length >= 2) {
      insights.push(`Dataset contains ${stats.length} numeric variables for correlation analysis`);
    }

    // Data quality insights
    const missingValues = Object.keys(data[0]).some(key => 
      data.some(row => row[key] === null || row[key] === undefined)
    );
    if (missingValues) {
      insights.push("Dataset contains missing values that may need attention");
    }

    return insights;
  };

  const exportData = (format: 'json' | 'csv') => {
    if (data.length === 0) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'data.json';
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
      ];
      content = csvRows.join('\n');
      filename = 'data.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Data exported as ${format.toUpperCase()}`
    });
  };

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>No data to visualize</p>
            <p className="text-sm">Load a dataset or paste your data to get started</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      width: '100%',
      height: 400,
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartConfig.type) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              <Bar dataKey={chartConfig.yAxis} fill={chartConfig.colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsLineChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={chartConfig.yAxis} 
                stroke={chartConfig.colors[0]} 
                strokeWidth={2}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey={chartConfig.dataKey}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig.colors[index % chartConfig.colors.length]} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={chartConfig.yAxis} 
                stroke={chartConfig.colors[0]} 
                fill={chartConfig.colors[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={chartConfig.xAxis} />
              <PolarRadiusAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              <Radar
                name="Data"
                dataKey={chartConfig.yAxis}
                stroke={chartConfig.colors[0]}
                fill={chartConfig.colors[0]}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Visualizer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedDataset} onValueChange={loadSampleDataset}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sample Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Data</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="demographics">Demographics</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={generateAnalysis}>
            <Brain className="h-4 w-4 mr-2" />
            Analyze
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => exportData('json')}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex h-96">
          {/* Main Chart Area */}
          <div className="flex-1 p-4">
            <div className="mb-4">
              <Input
                placeholder="Chart Title"
                value={chartConfig.title}
                onChange={(e) => setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
            {renderChart()}
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-muted/20">
            <Tabs defaultValue="config" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="config">Config</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="config" className="h-full p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chart Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {chartTypes.map(type => (
                      <Button
                        key={type.id}
                        variant={chartConfig.type === type.id ? 'default' : 'outline'}
                        size="sm"
                        className="flex flex-col gap-1 h-auto p-2"
                        onClick={() => setChartConfig(prev => ({ ...prev, type: type.id as any }))}
                      >
                        <type.icon className="h-4 w-4" />
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {data.length > 0 && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">X Axis</label>
                      <Select
                        value={chartConfig.xAxis}
                        onValueChange={(value) => setChartConfig(prev => ({ ...prev, xAxis: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(data[0]).map(key => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Y Axis</label>
                      <Select
                        value={chartConfig.yAxis}
                        onValueChange={(value) => setChartConfig(prev => ({ ...prev, yAxis: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(data[0]).map(key => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Color Palette</label>
                  <div className="space-y-2">
                    {colorPalettes.map((palette, index) => (
                      <div
                        key={index}
                        className={`flex gap-1 p-2 rounded cursor-pointer border ${
                          chartConfig.colors === palette ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => setChartConfig(prev => ({ ...prev, colors: palette }))}
                      >
                        {palette.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="h-full p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Raw Data (JSON)</label>
                    <Textarea
                      value={rawData}
                      onChange={(e) => setRawData(e.target.value)}
                      placeholder="Paste your JSON data here..."
                      className="h-32 font-mono text-xs"
                    />
                    <Button 
                      onClick={parseRawData} 
                      className="mt-2 w-full" 
                      size="sm"
                    >
                      Parse Data
                    </Button>
                  </div>

                  {data.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Data Preview</span>
                        <Badge variant="secondary">{data.length} rows</Badge>
                      </div>
                      <ScrollArea className="h-48 border rounded">
                        <div className="p-2">
                          {data.slice(0, 10).map((row, index) => (
                            <div key={index} className="text-xs mb-1 p-1 bg-muted/50 rounded">
                              {JSON.stringify(row)}
                            </div>
                          ))}
                          {data.length > 10 && (
                            <div className="text-xs text-muted-foreground text-center py-2">
                              ... and {data.length - 10} more rows
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="h-full p-4">
                <ScrollArea className="h-full">
                  {analysis ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Dataset Overview</h4>
                        <div className="space-y-1 text-sm">
                          <div>Total Rows: <Badge variant="secondary">{analysis.totalRows}</Badge></div>
                          <div>Columns: <Badge variant="secondary">{analysis.columns.length}</Badge></div>
                          <div>Numeric Columns: <Badge variant="secondary">{analysis.numericColumns.length}</Badge></div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Statistics</h4>
                        <div className="space-y-3">
                          {analysis.statistics.map((stat: any, index: number) => (
                            <div key={index} className="border rounded p-3">
                              <div className="font-medium mb-2">{stat.column}</div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Mean: {stat.mean}</div>
                                <div>Median: {stat.median}</div>
                                <div>Min: {stat.min}</div>
                                <div>Max: {stat.max}</div>
                                <div>Std Dev: {stat.stdDev}</div>
                                <div>Count: {stat.count}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Insights</h4>
                        <div className="space-y-2">
                          {analysis.insights.map((insight: string, index: number) => (
                            <div key={index} className="text-sm p-2 bg-blue-50 dark:bg-blue-950 rounded">
                              {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="h-8 w-8 mx-auto mb-2" />
                      <p>No analysis available</p>
                      <Button onClick={generateAnalysis} className="mt-2" size="sm">
                        Generate Analysis
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="export" className="h-full p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Export Options</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => exportData('json')}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => exportData('csv')}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Chart Export</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Save as PNG
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Save as SVG
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}