
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Separator } from "./ui/separator";

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  source: {
    name: string;
  };
  publishedAt: string;
};

const loadingSteps = [
    "Fetching top headlines...",
    "Analyzing the latest sources...",
    "Compiling your news feed...",
    "Almost there, just a moment...",
];


export function NewsContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


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

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?category=general&page=1`);
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch news");
      }
      const data = await res.json();
      
      const newArticles = (data.articles || []).filter((article: Article) => article.title && article.title !== "[Removed]");
      setArticles(newArticles);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

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
    fetchNews();
  };

  return (
    <>
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 text-center relative">
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

        {error && (
             <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
                <p className="text-destructive font-semibold">Failed to load news</p>
                <p className="text-destructive/80 text-sm mt-1">{error}</p>
                 <p className="text-destructive/80 text-sm mt-4">Please make sure your NewsAPI key is set in the .env file.</p>
            </div>
        )}

        {loading && articles.length === 0 ? (
             <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-24 w-32 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        ) : !error && articles.length === 0 ? (
            <div className="text-center text-muted-foreground mt-12">
                <p>No new articles found for this category. Please check back later!</p>
            </div>
        ) : (
            <div className="space-y-6">
                {articles.map((article, i) => (
                    <div 
                        key={`${article.url}-${i}`}
                        className="group grid grid-cols-1 md:grid-cols-[150px_1fr] lg:grid-cols-[200px_1fr] gap-4 cursor-pointer"
                        onClick={() => handleReadMore(article)}
                    >
                        <div className="relative w-full aspect-square md:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                            {article.urlToImage ? (
                                <Image
                                    src={article.urlToImage}
                                    alt={article.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    unoptimized
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : <div className="w-full h-full bg-muted"></div>}
                        </div>
                        <div className="flex flex-col">
                             <h2 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">{article.title}</h2>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.description}</p>
                            <p className="text-xs text-muted-foreground mt-auto pt-2">{new Date(article.publishedAt).toLocaleDateString()} &middot; {article.source.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
    </>
  );
}
