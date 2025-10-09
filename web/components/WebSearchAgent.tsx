
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Globe, ChevronsRight, ExternalLink } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { extractGoogleResults } from '../utils/extractors';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  domain: string;
  thumbnail?: string;
}

const WebSearchAgent = () => {
  const [query, setQuery] = useState('');
  const [webviewUrl, setWebviewUrl] = useState('https://www.google.com/webhp?igu=1');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webviewRef = useRef<any>(null);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setResults([]);
    setError(null);
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    setWebviewUrl(url);
  };

  const handleExtraction = useCallback(() => {
    if (webviewRef.current) {
      setTimeout(() => {
        webviewRef.current.executeJavaScript(extractGoogleResults.toString() + '; extractGoogleResults();')
          .then((extractedResults: SearchResult[]) => {
            if (extractedResults && extractedResults.length > 0) {
              setResults(extractedResults);
              window.electronAPI.sendSearchResults({ query, results: extractedResults });
            } else {
              setError('Failed to extract results. The page structure might have changed.');
            }
            setIsLoading(false);
          })
          .catch((err: any) => {
            console.error('Error executing script in webview:', err);
            setError('An error occurred while trying to read the search results.');
            setIsLoading(false);
          });
      }, 900); // Delay to allow dynamic content to render
    }
  }, [query]);

  const convertToEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('open.spotify.com/track')) {
      const trackId = url.split('/track/')[1]?.split('?')[0];
      return trackId ? `https://open.spotify.com/embed/track/${trackId}` : null;
    }
    return url;
  };

  const openInApp = (url: string) => {
    const embedUrl = convertToEmbedUrl(url);
    if (embedUrl) {
      setWebviewUrl(embedUrl);
    } else {
      // Fallback for non-embeddable links, attempt to open in webview
      setWebviewUrl(url);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    const webview = webviewRef.current;
    if (webview) {
      const handleDomReady = () => {
        if (webview.getURL().includes('google.com/search')) {
          handleExtraction();
        }
      };

      const handleDidNavigate = (event: any) => {
        const currentUrl = event.url;
        setWebviewUrl(currentUrl);
        // Inform chat that navigation happened
        window.electronAPI.sendWebViewNavigation(currentUrl);
      };

      webview.addEventListener('dom-ready', handleDomReady);
      webview.addEventListener('did-navigate', handleDidNavigate);
      
      return () => {
        webview.removeEventListener('dom-ready', handleDomReady);
        webview.removeEventListener('did-navigate', handleDidNavigate);
      };
    }
  }, [handleExtraction]);

  // Listen for search requests from the main chat UI
  useEffect(() => {
    // This is a placeholder for actual IPC communication from your chat component
    const handleGlobalSearch = (event: CustomEvent) => {
      setQuery(event.detail.query);
      handleSearch(event.detail.query);
    };
    window.addEventListener('global-search', handleGlobalSearch as EventListener);
    return () => window.removeEventListener('global-search', handleGlobalSearch as EventListener);
  }, []);

  return (
    <div className="flex h-full gap-4">
      {/* Chat and Results Panel */}
      <div className="w-1/2 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Web Search</CardTitle>
            <CardDescription>Enter a query to search Google and see results here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Google..."
              />
              <Button type="submit" disabled={isLoading}><Search className="h-4 w-4" /></Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="mb-4 p-4"><Skeleton className="h-20 w-full" /></Card>
          ))}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && results.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Showing top {results.length} results for "{query}"</p>
              {results.map((result, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4">
                    <a onClick={() => openInApp(result.link)} className="cursor-pointer">
                      <p className="text-xs text-green-600">{result.domain}</p>
                      <h3 className="text-lg font-semibold text-blue-500 hover:underline">{result.title}</h3>
                    </a>
                    <p className="text-sm text-gray-600 mt-1">{result.snippet}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => openInApp(result.link)}><ChevronsRight className="h-4 w-4 mr-1"/>Open in App</Button>
                      <Button size="sm" variant="ghost" onClick={() => openInNewTab(result.link)}><ExternalLink className="h-4 w-4 mr-1"/>New Tab</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Webview Panel */}
      <div className="w-1/2">
        <Card className="h-full">
          <CardContent className="p-1 h-full">
            <webview
              ref={webviewRef}
              src={webviewUrl}
              className="w-full h-full border-0"
              allowpopups="true"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebSearchAgent;
