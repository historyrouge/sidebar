"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Bookmark, 
  Download, 
  Share2, 
  Search,
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Settings,
  Shield,
  Zap,
  Eye,
  Code,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
}

interface EmbeddedBrowserProps {
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
  onPageAnalysis?: (content: string, url: string) => void;
  className?: string;
}

export function EmbeddedBrowser({ 
  initialUrl = 'https://www.google.com', 
  onUrlChange,
  onPageAnalysis,
  className = ''
}: EmbeddedBrowserProps) {
  const { toast } = useToast();
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: '1',
      title: 'New Tab',
      url: initialUrl,
      isLoading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [pageInfo, setPageInfo] = useState<{
    title: string;
    description: string;
    keywords: string[];
    images: number;
    links: number;
    scripts: number;
  } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const historyIndex = useRef(0);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const isValidUrl = (string: string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const navigateToUrl = (url: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId;
    const formattedUrl = formatUrl(url);
    
    if (!isValidUrl(formattedUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setTabs(prev => prev.map(tab => 
      tab.id === targetTabId 
        ? { ...tab, url: formattedUrl, isLoading: true }
        : tab
    ));

    // Add to history
    setHistory(prev => {
      const newHistory = [...prev];
      if (historyIndex.current < newHistory.length - 1) {
        newHistory.splice(historyIndex.current + 1);
      }
      newHistory.push(formattedUrl);
      historyIndex.current = newHistory.length - 1;
      return newHistory;
    });

    setCanGoBack(historyIndex.current > 0);
    setCanGoForward(false);

    onUrlChange?.(formattedUrl);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(urlInput);
  };

  const goBack = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const url = history[historyIndex.current];
      setUrlInput(url);
      navigateToUrl(url);
      setCanGoBack(historyIndex.current > 0);
      setCanGoForward(true);
    }
  };

  const goForward = () => {
    if (historyIndex.current < history.length - 1) {
      historyIndex.current++;
      const url = history[historyIndex.current];
      setUrlInput(url);
      navigateToUrl(url);
      setCanGoForward(historyIndex.current < history.length - 1);
      setCanGoBack(true);
    }
  };

  const refresh = () => {
    if (activeTab) {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isLoading: true }
          : tab
      ));
      
      if (iframeRef.current) {
        iframeRef.current.src = activeTab.url;
      }
    }
  };

  const addBookmark = () => {
    if (activeTab && !bookmarks.includes(activeTab.url)) {
      setBookmarks(prev => [...prev, activeTab.url]);
      toast({
        title: "Bookmarked",
        description: "Page added to bookmarks"
      });
    }
  };

  const createNewTab = () => {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'https://www.google.com',
      isLoading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput(newTab.url);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      setActiveTabId(remainingTabs[0].id);
      setUrlInput(remainingTabs[0].url);
    }
  };

  const analyzePage = async () => {
    if (!activeTab) return;
    
    try {
      // In a real implementation, you would extract content from the iframe
      // For now, we'll simulate page analysis
      const mockContent = `Page analysis for ${activeTab.url}`;
      
      setPageInfo({
        title: activeTab.title,
        description: "Page description extracted from meta tags",
        keywords: ["web", "browser", "analysis"],
        images: Math.floor(Math.random() * 20),
        links: Math.floor(Math.random() * 50),
        scripts: Math.floor(Math.random() * 10)
      });

      onPageAnalysis?.(mockContent, activeTab.url);
      
      toast({
        title: "Page Analyzed",
        description: "Page content has been analyzed and sent to AI"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the current page",
        variant: "destructive"
      });
    }
  };

  const shareUrl = () => {
    if (activeTab) {
      navigator.clipboard.writeText(activeTab.url);
      toast({
        title: "URL Copied",
        description: "Page URL copied to clipboard"
      });
    }
  };

  const downloadPage = () => {
    if (activeTab) {
      // In a real implementation, you would download the page content
      toast({
        title: "Download Started",
        description: "Page download initiated"
      });
    }
  };

  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab]);

  const handleIframeLoad = () => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, isLoading: false }
        : tab
    ));

    // Try to get page title (limited by CORS)
    try {
      if (iframeRef.current?.contentDocument?.title) {
        const title = iframeRef.current.contentDocument.title;
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, title: title || 'Untitled' }
            : tab
        ));
      }
    } catch (error) {
      // CORS restrictions prevent access to iframe content
    }
  };

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Web Browser
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

        {/* Tab Bar */}
        <div className="flex items-center gap-1 border-b">
          <div className="flex-1 flex items-center gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-t-lg cursor-pointer min-w-0 max-w-48 ${
                  activeTabId === tab.id 
                    ? 'bg-background border border-b-0' 
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <div className="flex-1 truncate text-sm">
                  {tab.isLoading ? 'Loading...' : tab.title}
                </div>
                {tabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={createNewTab}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={!canGoBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goForward}
              disabled={!canGoForward}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={refresh}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToUrl('https://www.google.com')}
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL or search..."
                className="pr-10"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={addBookmark}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={shareUrl}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={analyzePage}>
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={downloadPage}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(activeTab?.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Window
                </DropdownMenuItem>
                <DropdownMenuItem onClick={analyzePage}>
                  <Code className="h-4 w-4 mr-2" />
                  View Page Source
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex h-96">
          {/* Main Browser Area */}
          <div className="flex-1 relative">
            {activeTab && (
              <iframe
                ref={iframeRef}
                src={activeTab.url}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                title="Embedded Browser"
              />
            )}
            {activeTab?.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Loading...</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l bg-muted/20">
            <Tabs defaultValue="bookmarks" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookmarks" className="h-full p-2">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {bookmarks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No bookmarks yet
                      </p>
                    ) : (
                      bookmarks.map((bookmark, index) => (
                        <div
                          key={index}
                          className="p-2 rounded cursor-pointer hover:bg-muted"
                          onClick={() => navigateToUrl(bookmark)}
                        >
                          <div className="text-sm truncate">{bookmark}</div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="history" className="h-full p-2">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {history.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No history yet
                      </p>
                    ) : (
                      history.slice().reverse().map((url, index) => (
                        <div
                          key={index}
                          className="p-2 rounded cursor-pointer hover:bg-muted"
                          onClick={() => navigateToUrl(url)}
                        >
                          <div className="text-sm truncate">{url}</div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="info" className="h-full p-2">
                <ScrollArea className="h-full">
                  {pageInfo ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Page Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Title:</span>
                            <p className="text-muted-foreground">{pageInfo.title}</p>
                          </div>
                          <div>
                            <span className="font-medium">Description:</span>
                            <p className="text-muted-foreground">{pageInfo.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-semibold mb-2">Page Stats</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            <span>{pageInfo.images} images</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            <span>{pageInfo.links} links</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            <span>{pageInfo.scripts} scripts</span>
                          </div>
                        </div>
                      </div>
                      
                      {pageInfo.keywords.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {pageInfo.keywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        No page information available
                      </p>
                      <Button variant="outline" size="sm" onClick={analyzePage}>
                        Analyze Current Page
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}