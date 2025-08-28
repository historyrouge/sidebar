
"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import { BackButton } from "./back-button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

declare const puter: any;

const ebooks = [
  {
    title: "The Art of Programming",
    description: "An essential guide to the fundamentals of computer programming and software design, covering algorithms, data structures, and more.",
    coverUrl: "https://placehold.co/300x400.png",
  },
  {
    title: "A Journey Through the Cosmos",
    description: "Explore the wonders of the universe, from the Big Bang to the most distant galaxies. A captivating read for astronomy enthusiasts.",
    coverUrl: "https://placehold.co/300x400.png",
  },
  {
    title: "The History of Ancient Civilizations",
    description: "A comprehensive look at the rise and fall of the world's most influential ancient societies, from Mesopotamia to Rome.",
    coverUrl: "https://placehold.co/300x400.png",
  },
];

type ContentBlock = {
    type: 'h1' | 'h2' | 'p';
    text: string;
}
type ChapterContent = ContentBlock[];

const ebookSystemPrompt = `You are a creative and knowledgeable author. Your task is to write a chapter for an ebook.

Ebook Title: {{title}}
Chapter Number: {{chapter}}

You must generate the content for this chapter in a valid JSON format. The JSON object should contain a single key, "content", which is an array of content blocks. Each block must have a 'type' ('h1', 'h2', 'p') and a 'text'.
- Start with a single 'h1' element for the chapter title.
- Use a mix of 'h2' elements for section headings and 'p' elements for paragraphs.
- Generate about 5-7 content blocks in total for the chapter.
- The content should be appropriate for the book's title and the chapter number, creating a logical progression.
- For chapter 1, provide a strong introduction to the topic. For subsequent chapters, build upon the previous one.
- Make the content interesting and educational.

Example for a book titled "A Journey Through the Cosmos", Chapter 1:
{
    "content": [
        { "type": "h1", "text": "Chapter 1: The Big Bang" },
        { "type": "p", "text": "The Big Bang theory is the leading cosmological model..." },
        { "type": "h2", "text": "1.1: Cosmic Inflation" },
        { "type": "p", "text": "Cosmic inflation is a theory of exponential expansion of space in the early universe..." }
    ]
}
`;


export function EbookReader({ slug }: { slug: string }) {
  const [bookTitle, setBookTitle] = useState<string>("");
  const [chapters, setChapters] = useState<Record<number, ChapterContent>>({});
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isLoading, startLoading] = useTransition();
  const [isPrefetching, startPrefetching] = useTransition();
  const { toast } = useToast();

  const fetchChapter = useCallback(async (chapterNumber: number) => {
    if (!bookTitle || typeof puter === 'undefined') return;

    const action = chapterNumber > currentChapter || Object.keys(chapters).length === 0 ? startLoading : startPrefetching;

    action(async () => {
      try {
        const prompt = ebookSystemPrompt
            .replace('{{title}}', bookTitle)
            .replace('{{chapter}}', String(chapterNumber));
        
        const response = await puter.ai.chat(prompt);
        const responseText = typeof response === 'object' && response.text ? response.text : String(response);
        const jsonResponse = JSON.parse(responseText);

        if (jsonResponse.content) {
            setChapters(prev => ({ ...prev, [chapterNumber]: jsonResponse.content }));
        } else {
             throw new Error("Invalid format from AI.");
        }
      } catch (e: any) {
         toast({
          title: `Failed to load Chapter ${chapterNumber}`,
          description: e.message || "An error occurred with Puter.js",
          variant: "destructive"
        });
      }
    });
  }, [bookTitle, currentChapter, chapters, toast]);


  useEffect(() => {
    const foundBook = ebooks.find(b => slugify(b.title) === slug);
    if (foundBook) {
      setBookTitle(foundBook.title);
    }
  }, [slug]);

  useEffect(() => {
    if (bookTitle && !chapters[1] && typeof puter !== 'undefined') {
      fetchChapter(1);
    } else if (typeof puter === 'undefined') {
        toast({
            title: "Puter.js not available",
            description: "eBook generation is disabled. Please try again later.",
            variant: "destructive"
        });
    }
  }, [bookTitle, chapters, fetchChapter, toast]);

  // Prefetch next chapter
  useEffect(() => {
    if (bookTitle && chapters[currentChapter] && !chapters[currentChapter + 1] && typeof puter !== 'undefined') {
      fetchChapter(currentChapter + 1);
    }
  }, [bookTitle, chapters, currentChapter, fetchChapter]);

  const handleNextChapter = () => {
    setCurrentChapter(prev => prev + 1);
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    }
  };


  const renderContent = () => {
      const content = chapters[currentChapter];
      if (isLoading && !content) {
          return (
             <div className="prose dark:prose-invert max-w-3xl mx-auto space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-full mt-4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-full mt-4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
            </div>
          )
      }
      if (!content) {
        return (
             <div className="flex-1 flex items-center justify-center text-center">
                <div>
                    <h2 className="text-2xl font-bold">Chapter not found</h2>
                    <p className="text-muted-foreground">Could not load content for this chapter.</p>
                </div>
            </div>
        )
      }

    return content.map((item, index) => {
      switch (item.type) {
        case 'h1': return <h1 key={index} className="text-4xl font-bold mt-8 mb-4 !pb-2 !border-b-2">{item.text}</h1>;
        case 'h2': return <h2 key={index} className="text-2xl font-semibold mt-6 mb-3 !pb-1 !border-b">{item.text}</h2>;
        case 'p': return <p key={index} className="text-lg leading-relaxed">{item.text}</p>;
        default: return <p key={index}>{item.text}</p>;
      }
    });
  }

  if (!bookTitle) {
     return (
        <div className="flex-1 flex items-center justify-center text-center">
            <div>
                <h2 className="text-2xl font-bold">Book not found</h2>
                <p className="text-muted-foreground">The requested eBook could not be found.</p>
                <Link href="/ebooks"><Button variant="link" className="mt-4">Back to Library</Button></Link>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <BackButton />
        <div className="flex-1 mx-4 truncate">
          <h1 className="text-lg font-semibold truncate">{bookTitle}</h1>
        </div>
        <SidebarTrigger />
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </main>
       <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t bg-background px-4 md:px-6">
            <Button variant="outline" onClick={handlePrevChapter} disabled={currentChapter === 1 || isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Chapter
            </Button>
            <span className="text-sm text-muted-foreground">Chapter {currentChapter}</span>
            <Button variant="outline" onClick={handleNextChapter} disabled={isLoading && !chapters[currentChapter + 1]}>
                 {(isLoading && !chapters[currentChapter + 1]) || (isPrefetching && !chapters[currentChapter+1]) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                Next Chapter
            </Button>
        </footer>
    </div>
  );
}
