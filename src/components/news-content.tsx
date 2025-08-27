
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rss } from "lucide-react";
import { BackButton } from "./back-button";
import { AiDialog } from "./ai-dialog";

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

export function NewsContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch news");
        }
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    setIsAiDialogOpen(true);
  }

  return (
    <>
    <AiDialog 
        isOpen={isAiDialogOpen}
        onOpenChange={setIsAiDialogOpen}
        title={selectedArticle?.title ?? ""}
        context={selectedArticle?.description ?? ""}
        imageUrl={selectedArticle?.urlToImage}
    />
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 text-center relative">
            <BackButton className="absolute left-0 top-1/2 -translate-y-1/2" />
            <Rss className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Latest News</h1>
            <p className="mt-2 text-lg text-muted-foreground">Top headlines in technology and education.</p>
        </header>

        {error && (
             <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
                <p className="text-destructive font-semibold">Failed to load news</p>
                <p className="text-destructive/80 text-sm mt-1">{error}</p>
                 <p className="text-destructive/80 text-sm mt-4">Please make sure your NewsAPI key is set in the .env file.</p>
            </div>
        )}

        {!loading && !error && articles.length === 0 && (
            <div className="text-center text-muted-foreground">
                <p>No articles found.</p>
            </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {articles.map((article, i) => (
                <Card key={i} className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                    {article.urlToImage ? (
                        <CardHeader className="p-0">
                            <div className="relative w-full h-48">
                                <Image
                                    src={article.urlToImage}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </CardHeader>
                    ) : (
                        <div className="h-48 bg-muted flex items-center justify-center">
                            <Rss className="w-10 h-10 text-muted-foreground" />
                        </div>
                    )}
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
    </div>
    </>
  );
}
