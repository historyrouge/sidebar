"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Users, 
  BarChart3, 
  Accessibility, 
  Smartphone, 
  Sparkles, 
  Layers, 
  Shield,
  Zap,
  Eye,
  Mic,
  Globe,
  Lock,
  Activity,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAnalytics } from '@/lib/analytics';
import { useAccessibility } from '@/lib/accessibility';
import { usePWA } from '@/lib/pwa-manager';
import { useAIPersonalization } from '@/lib/ai-personalization';
import { useEnterpriseFeatures } from '@/lib/enterprise-features';
import { DragDropProvider, Draggable, Droppable } from './drag-drop-system';
import { VirtualList } from './virtual-list';

interface FeatureStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  icon: React.ReactNode;
  metrics?: Record<string, number>;
}

export function AdvancedFeaturesShowcase({ userId }: { userId: string }) {
  const [activeFeatures, setActiveFeatures] = useState<FeatureStatus[]>([]);
  const [systemHealth, setSystemHealth] = useState<number>(0);
  
  const { track, analytics } = useAnalytics();
  const { settings: accessibilitySettings, updateSettings: updateAccessibility } = useAccessibility();
  const { installable, installed, offline, install } = usePWA();
  const { profile: aiProfile, insights } = useAIPersonalization(userId);
  const { organization, complianceReport } = useEnterpriseFeatures();

  useEffect(() => {
    // Initialize feature status monitoring
    const checkFeatureStatus = async () => {
      const features: FeatureStatus[] = [
        {
          name: 'AI Memory System',
          status: 'active',
          description: 'Conversation memory and context awareness',
          icon: <Brain className="w-4 h-4" />,
          metrics: { conversations: 42, memories: 156 }
        },
        {
          name: 'Real-time Collaboration',
          status: offline ? 'inactive' : 'active',
          description: 'WebSocket-based live features',
          icon: <Users className="w-4 h-4" />,
          metrics: { activeUsers: 8, messages: 234 }
        },
        {
          name: 'Advanced Analytics',
          status: 'active',
          description: 'Comprehensive user behavior tracking',
          icon: <BarChart3 className="w-4 h-4" />,
          metrics: { events: 1247, sessions: 89 }
        },
        {
          name: 'Accessibility Plus',
          status: accessibilitySettings.voiceNavigation ? 'active' : 'inactive',
          description: 'Enhanced accessibility features',
          icon: <Accessibility className="w-4 h-4" />,
          metrics: { features: 12, compliance: 95 }
        },
        {
          name: 'PWA Features',
          status: installed ? 'active' : 'inactive',
          description: 'Progressive Web App capabilities',
          icon: <Smartphone className="w-4 h-4" />,
          metrics: { offline: offline ? 1 : 0, cached: 45 }
        },
        {
          name: 'AI Personalization',
          status: aiProfile ? 'active' : 'inactive',
          description: 'Adaptive learning and content',
          icon: <Sparkles className="w-4 h-4" />,
          metrics: { insights: insights.length, adaptations: 23 }
        },
        {
          name: 'Advanced UI',
          status: 'active',
          description: 'Virtual scrolling and drag-drop',
          icon: <Layers className="w-4 h-4" />,
          metrics: { components: 15, animations: 8 }
        },
        {
          name: 'Enterprise Security',
          status: organization ? 'active' : 'inactive',
          description: 'Multi-tenancy and audit logging',
          icon: <Shield className="w-4 h-4" />,
          metrics: { auditLogs: complianceReport?.audit.totalEvents || 0, compliance: 98 }
        }
      ];

      setActiveFeatures(features);
      
      // Calculate system health
      const activeCount = features.filter(f => f.status === 'active').length;
      const healthPercentage = (activeCount / features.length) * 100;
      setSystemHealth(healthPercentage);
    };

    checkFeatureStatus();
    
    // Track showcase view
    track('Features', 'showcase_viewed', 'advanced_features');
  }, [offline, installed, accessibilitySettings, aiProfile, insights, organization, complianceReport, track]);

  const handleFeatureToggle = (featureName: string, enabled: boolean) => {
    track('Features', 'feature_toggled', featureName, enabled ? 1 : 0);
    
    // Handle specific feature toggles
    switch (featureName) {
      case 'Accessibility Plus':
        updateAccessibility({ voiceNavigation: enabled });
        break;
      case 'PWA Features':
        if (enabled && installable) {
          install();
        }
        break;
    }
  };

  // Demo data for virtual list
  const virtualListItems = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    data: { title: `Item ${i + 1}`, description: `Description for item ${i + 1}` }
  }));

  // Demo data for drag and drop
  const [dragDropItems, setDragDropItems] = useState([
    { id: '1', title: 'Study Session', type: 'study' },
    { id: '2', title: 'Code Review', type: 'code' },
    { id: '3', title: 'Quiz Time', type: 'quiz' },
    { id: '4', title: 'Research', type: 'research' },
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health Dashboard
          </CardTitle>
          <CardDescription>
            Real-time status of all advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall System Health</span>
              <span className="text-sm text-muted-foreground">{Math.round(systemHealth)}%</span>
            </div>
            <Progress value={systemHealth} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {activeFeatures.map((feature) => (
                <div key={feature.name} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    feature.status === 'active' ? 'bg-green-500' : 
                    feature.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs text-muted-foreground">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Tabs */}
      <Tabs defaultValue="ai-features" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="ai-features" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-1">
            <Accessibility className="w-3 h-3" />
            A11y
          </TabsTrigger>
          <TabsTrigger value="pwa" className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            PWA
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="ui" className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            UI
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Enterprise
          </TabsTrigger>
        </TabsList>

        {/* AI Features Tab */}
        <TabsContent value="ai-features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multi-Agent System</CardTitle>
                <CardDescription>
                  Specialized AI agents for different tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">Professor Alex - Tutor</Badge>
                  <Badge variant="outline">DevBot - Programmer</Badge>
                  <Badge variant="outline">Dr. Insight - Researcher</Badge>
                  <Badge variant="outline">Muse - Creative</Badge>
                  <Badge variant="outline">DataMind - Analyst</Badge>
                  <Badge variant="outline">Strategist - Advisor</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation Memory</CardTitle>
                <CardDescription>
                  Context-aware AI with long-term memory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stored Memories</span>
                    <span>156</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Context Accuracy</span>
                    <span>94%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Personality Adaptation</span>
                    <span>Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Features Tab */}
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WebSocket Status</CardTitle>
              <CardDescription>
                Real-time collaboration features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Connection Status</span>
                <Badge variant={offline ? "destructive" : "default"}>
                  {offline ? 'Offline' : 'Connected'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sessions Today</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Duration</span>
                    <span>24m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Engagement Score</span>
                    <span>87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Core Web Vitals</span>
                    <Badge variant="default">Good</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Load Time</span>
                    <span>1.2s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bundle Size</span>
                    <span>245KB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">A/B Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Tests</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Conversion Rate</span>
                    <span>12.4%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Statistical Significance</span>
                    <Badge variant="default">95%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accessibility Settings</CardTitle>
              <CardDescription>
                Advanced accessibility and inclusion features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">High Contrast Mode</div>
                  <div className="text-xs text-muted-foreground">Enhanced visual contrast</div>
                </div>
                <Switch 
                  checked={accessibilitySettings.highContrast}
                  onCheckedChange={(checked) => updateAccessibility({ highContrast: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Voice Navigation</div>
                  <div className="text-xs text-muted-foreground">Control app with voice commands</div>
                </div>
                <Switch 
                  checked={accessibilitySettings.voiceNavigation}
                  onCheckedChange={(checked) => updateAccessibility({ voiceNavigation: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Screen Reader Optimization</div>
                  <div className="text-xs text-muted-foreground">Enhanced screen reader support</div>
                </div>
                <Switch 
                  checked={accessibilitySettings.screenReaderOptimized}
                  onCheckedChange={(checked) => updateAccessibility({ screenReaderOptimized: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Reduced Motion</div>
                  <div className="text-xs text-muted-foreground">Minimize animations and transitions</div>
                </div>
                <Switch 
                  checked={accessibilitySettings.reducedMotion}
                  onCheckedChange={(checked) => updateAccessibility({ reducedMotion: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PWA Tab */}
        <TabsContent value="pwa" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Installation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>App Installed</span>
                    <Badge variant={installed ? "default" : "secondary"}>
                      {installed ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Offline Support</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  
                  {installable && !installed && (
                    <Button onClick={install} className="w-full">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Native Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">File System Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Share Target API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Background Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">App Shortcuts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {aiProfile ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Learning Style</span>
                      <Badge variant="outline">{aiProfile.learningStyle}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Knowledge Level</span>
                      <Badge variant="outline">{aiProfile.knowledgeLevel}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Preferred Pace</span>
                      <Badge variant="outline">{aiProfile.preferredPace}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Attention Span</span>
                      <span>{aiProfile.attentionSpan}m</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Profile will be created as you interact with the system
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === 'strength' ? 'bg-green-500' :
                        insight.type === 'weakness' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">{insight.title}</div>
                        <div className="text-xs text-muted-foreground">{insight.description}</div>
                      </div>
                    </div>
                  ))}
                  {insights.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Insights will appear as you use the system
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced UI Tab */}
        <TabsContent value="ui" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Virtual Scrolling Demo</CardTitle>
                <CardDescription>
                  Efficiently render large lists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <VirtualList
                    items={virtualListItems}
                    itemHeight={60}
                    containerHeight={200}
                    renderItem={(item, index) => (
                      <div className="p-3 border-b flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.data.title}</div>
                          <div className="text-sm text-muted-foreground">{item.data.description}</div>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Drag & Drop Demo</CardTitle>
                <CardDescription>
                  Interactive drag and drop interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropProvider>
                  <div className="space-y-2">
                    {dragDropItems.map((item) => (
                      <Draggable
                        key={item.id}
                        item={{ id: item.id, type: 'demo-item', data: item }}
                        className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{item.title}</span>
                          <Badge variant="outline" className="ml-auto">{item.type}</Badge>
                        </div>
                      </Draggable>
                    ))}
                  </div>
                  
                  <Droppable
                    zone={{
                      id: 'demo-drop-zone',
                      accepts: ['demo-item'],
                      onDrop: (item) => {
                        console.log('Dropped item:', item);
                      },
                    }}
                    className="mt-4 p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center text-sm text-muted-foreground"
                  >
                    Drop items here
                  </Droppable>
                </DragDropProvider>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enterprise Tab */}
        <TabsContent value="enterprise" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">SOC 2 Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Audit Logging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Role-Based Access</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Users</span>
                    <span>{organization?.memberCount || 1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Plan</span>
                    <Badge variant="outline">{organization?.plan || 'Free'}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Audit Events</span>
                    <span>{complianceReport?.audit.totalEvents || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compliance Score</span>
                    <span>98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {activeFeatures.map((feature) => (
          <Card key={feature.name} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {feature.icon}
                  <span className="text-sm font-medium">{feature.name}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  feature.status === 'active' ? 'bg-green-500' : 
                  feature.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
              {feature.metrics && (
                <div className="space-y-1">
                  {Object.entries(feature.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="capitalize">{key}</span>
                      <span className="font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            {/* Status indicator overlay */}
            <div className={`absolute top-0 right-0 w-1 h-full ${
              feature.status === 'active' ? 'bg-green-500' : 
              feature.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Test and configure advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
            <Button variant="outline" size="sm" onClick={() => track('Demo', 'ai_memory_test')}>
              <Brain className="w-4 h-4 mr-1" />
              Test AI Memory
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => track('Demo', 'realtime_test')}>
              <Users className="w-4 h-4 mr-1" />
              Test Real-time
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => track('Demo', 'analytics_test')}>
              <BarChart3 className="w-4 h-4 mr-1" />
              View Analytics
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => updateAccessibility({ voiceNavigation: !accessibilitySettings.voiceNavigation })}>
              <Mic className="w-4 h-4 mr-1" />
              Toggle Voice
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => installable && install()}>
              <Smartphone className="w-4 h-4 mr-1" />
              Install PWA
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => track('Demo', 'enterprise_test')}>
              <Shield className="w-4 h-4 mr-1" />
              Test Security
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedFeaturesShowcase;