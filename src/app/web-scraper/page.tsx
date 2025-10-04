'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Globe, ExternalLink, Loader2, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface Source {
  title: string;
  url: string;
  summary: string;
  images?: string[];
}

export default function WebScraperPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I can help you find information from multiple websites. Just ask me anything - I\'ll search the web and provide you with comprehensive answers from reliable sources.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input.trim() }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while searching for information. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Web Scraper</h1>
              <p className="text-sm text-slate-400">Multi-site information</p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Searches</h3>
            {messages.filter(m => m.type === 'user').slice(-5).map((message) => (
              <div
                key={message.id}
                className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => setInput(message.content)}
              >
                <p className="text-sm text-slate-200 truncate">{message.content}</p>
                <p className="text-xs text-slate-400 mt-1">{formatTime(message.timestamp)}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Ask me anything</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            I'll search multiple websites and provide comprehensive answers with sources
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-slate-600'
                }`}>
                  {message.type === 'user' ? (
                    <MessageSquare className="w-4 h-4 text-white" />
                  ) : (
                    <Globe className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 ml-12'
                      : 'bg-slate-800 mr-12'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 mr-12">
                      <h4 className="text-sm font-medium text-slate-400 mb-3">
                        Sources ({message.sources.length})
                      </h4>
                      <div className="grid gap-3">
                        {message.sources.map((source, index) => (
                          <Card key={index} className="bg-slate-700 border-slate-600">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm text-slate-200 line-clamp-2">
                                  {source.title}
                                </CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 p-1 h-auto"
                                  onClick={() => window.open(source.url, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-slate-400 line-clamp-3 mb-2">
                                {source.summary}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {new URL(source.url).hostname}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {source.content.length} chars
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 mr-12 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-slate-400">Searching websites...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-700">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything... (e.g., 'Who is the PM of India?', 'Tell me about Newton's laws')"
                className="flex-1 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              I'll automatically find and scrape relevant websites to answer your question
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}