
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rss, RefreshCw, Loader2 } from "lucide-react";
import { BackButton } from "./back-button";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AnimatePresence, motion } from "framer-motion";

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  publishedAt: string;
};

const categories = [
    { name: "Top Headlines", value: "top" },
    { name: "Technology", value: "technology" },
    { name: "Artificial Intelligence", value: "ai" },
    { name: "Gaming", value: "gaming" },
];

const loadingSteps = [
    "Fetching top headlines...",
    "Analyzing the latest sources...",
    "Compiling your news feed...",
    "Almost there, just a moment...",
];


export function NewsContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("top");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const observer = useRef<IntersectionObserver>();
  const lastArticleElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
            setPage(prevPage => prevPage + 1);
        }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);


  useEffect(() => {
    let stepInterval: NodeJS.Timeout | undefined;
    if (loading) {
        setLoadingStep(0);
        stepInterval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % loadingSteps.length);
        }, 2000); // Change message every 2 seconds
    }
    return () => clearInterval(stepInterval);
  }, [loading]);

  const fetchNews = useCallback(async (category: string, pageNum: number) => {
    if (pageNum === 1) {
        setLoading(true);
    } else {
        setLoadingMore(true);
    }
    setError(null);
    try {
      let url = `/api/news?page=${pageNum}`;
      const searchCategory = category === 'top' ? 'general' : category;
      url += category === 'ai' ? `&q=artificial%20intelligence` : `&category=${searchCategory}`;
      
      const res = await fetch(url);
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch news");
      }
      const data = await res.json();
      
      const filteredArticles = (data.articles || []).filter((article: Article) => article.title && article.title !== "[Removed]");
      
      if (pageNum === 1) {
        setArticles(filteredArticles);
      } else {
        setArticles(prev => [...prev, ...filteredArticles]);
      }
      setHasMore(filteredArticles.length > 0);

    } catch (err: any) {
      setError(err.message);
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchNews(activeCategory, 1);
  }, [activeCategory, fetchNews]);

  useEffect(() => {
    if (page > 1) {
        fetchNews(activeCategory, page);
    }
  }, [page, activeCategory, fetchNews]);


  const handleReadMore = (article: Article) => {
    try {
        localStorage.setItem('selectedArticle', JSON.stringify(article));
        router.push('/news-reader');
    } catch (e) {
        console.error("Could not save article to localStorage", e);
        setError("Could not open article. Please try again.");
    }
  }

  const handleRefresh = () => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchNews(activeCategory, 1);
  };

  return (
    <>
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 text-center relative">
            <BackButton className="absolute left-0 top-1/2 -translate-y-1/2" />
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Latest News</h1>
            <div className="mt-2 text-lg text-muted-foreground h-7">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={loading ? loadingStep : 'default'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                       {loading ? loadingSteps[loadingStep] : "Top headlines in technology and education."}
                    </motion.p>
                </AnimatePresence>
            </div>
             <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={loading}
                className="absolute right-0 top-1/2 -translate-y-1/2"
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
        </header>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                {categories.map(cat => (
                    <TabsTrigger key={cat.value} value={cat.value}>{cat.name}</TabsTrigger>
                ))}
            </TabsList>
        </Tabs>

        {error && (
             <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
                <p className="text-destructive font-semibold">Failed to load news</p>
                <p className="text-destructive/80 text-sm mt-1">{error}</p>
                 <p className="text-destructive/80 text-sm mt-4">Please make sure your NewsAPI key is set in the .env file.</p>
            </div>
        )}

        {loading ? (
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                     <Card key={i}>
                        <CardHeader className="p-0">
                            <Skeleton className="h-48 w-full" />
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                           <Skeleton className="h-6 w-3/4" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : !error && articles.length === 0 ? (
            <div className="text-center text-muted-foreground mt-12">
                <p>No new articles found for this category. Please check back later!</p>
            </div>
        ) : (
            <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {articles.map((article, i) => (
                         <Card ref={i === articles.length - 1 ? lastArticleElementRef : null} key={i} className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                            <CardHeader className="p-0">
                                {article.urlToImage ? (
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={article.urlToImage}
                                            alt={article.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                        <Rss className="w-10 h-10 text-primary/50" />
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 flex-grow flex flex-col">
                                <CardTitle className="text-lg leading-snug flex-grow">{article.title}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">{new Date(article.publishedAt).toLocaleDateString()} &middot; {article.source.name}</p>
                                <CardDescription className="mt-2 text-sm line-clamp-3">{article.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button className="w-full" onClick={() => handleReadMore(article)}>Read More</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                {loadingMore && (
                     <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                 {!hasMore && !loadingMore && articles.length > 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        <p>You've reached the end of the news.</p>
                    </div>
                )}
            </>
        )}
    </div>
    </>
  );
}

    