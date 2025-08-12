
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/main-layout";

const ebooks = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      coverUrl: "https://placehold.co/300x450.png",
      dataAiHint: "classic novel",
    },
    {
      title: "1984",
      author: "George Orwell",
      coverUrl: "https://placehold.co/300x450.png",
      dataAiHint: "dystopian future",
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      coverUrl: "https://placehold.co/300x450.png",
      dataAiHint: "jazz age",
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      coverUrl: "https://placehold.co/300x450.png",
      dataAiHint: "romance novel",
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      coverUrl: "https://placehold.co/300x450.png",
      dataAiHint: "teenager protagonist",
    },
    {
      title: "Moby Dick",
      author: "Herman Melville",
      coverUrl: "https://placehold.co/300x450.png",
      dataAiHint: "whale story",
    },
    {
        title: "War and Peace",
        author: "Leo Tolstoy",
        coverUrl: "https://placehold.co/300x450.png",
        dataAiHint: "russian literature",
      },
      {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        coverUrl: "https://placehold.co/300x450.png",
        dataAiHint: "fantasy epic",
      },
];

function EbooksContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const handleReadNow = () => {
        toast({
            title: "Feature coming soon!",
            description: "The eBook reader will be implemented in a future update.",
        });
    };

    const filteredEbooks = ebooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-muted/20">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight">eBooks</h1>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search for books or authors..."
                        className="w-full rounded-lg bg-background pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredEbooks.map((book) => (
                         <Card key={book.title} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                             <CardContent className="p-0">
                                 <Image
                                     src={book.coverUrl}
                                     alt={`Cover of ${book.title}`}
                                     width={300}
                                     height={450}
                                     className="w-full h-auto object-cover"
                                     data-ai-hint={book.dataAiHint}
                                 />
                             </CardContent>
                             <CardFooter className="flex-col items-start p-4 space-y-2">
                                 <div className="flex-1">
                                    <h3 className="font-semibold text-sm leading-tight truncate">{book.title}</h3>
                                    <p className="text-xs text-muted-foreground">{book.author}</p>
                                 </div>
                                 <Button className="w-full" size="sm" variant="outline" onClick={handleReadNow}>
                                     Read Now
                                 </Button>
                             </CardFooter>
                         </Card>
                    ))}
                </div>
                {filteredEbooks.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No books found matching your search.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function EbooksPage() {
    return (
        <MainLayout>
            <EbooksContent />
        </MainLayout>
    )
}
