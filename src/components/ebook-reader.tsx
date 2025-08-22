
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { slugify } from "@/lib/utils";
import Link from "next/link";

const ebooks = [
  {
    title: "The Art of Programming",
    content: [
        { type: 'h1', text: 'Chapter 1: The Foundation' },
        { type: 'p', text: 'Computer programming is the process of designing and building an executable computer program to accomplish a specific computing result or to perform a particular task. Programming involves tasks such as: analysis, generating algorithms, profiling algorithms\' accuracy and resource consumption, and the implementation of algorithms in a chosen programming language (commonly referred to as coding).' },
        { type: 'p', text: 'The source code of a program is written in one or more languages that are intelligible to programmers, rather than machine code, which is directly executed by the central processing unit. The purpose of programming is to find a sequence of instructions that will automate the performance of a task (which can be as complex as an operating system) on a computer, often for solving a given problem.' },
        { type: 'h2', text: '1.1: Algorithms and Data Structures' },
        { type: 'p', text: 'An algorithm is a finite sequence of well-defined, computer-implementable instructions, typically to solve a class of problems or to perform a computation. Data structures are a way of organizing and storing data in a computer so that it can be accessed and modified efficiently. They are essential ingredients in creating fast and powerful algorithms.' },
        { type: 'p', text: 'Common data structures include arrays, linked lists, stacks, queues, trees, and graphs. Understanding their strengths and weaknesses is crucial for any programmer.' },
    ]
  },
  {
    title: "A Journey Through the Cosmos",
    content: [
        { type: 'h1', text: 'Chapter 1: The Big Bang' },
        { type: 'p', text: 'The Big Bang theory is the leading cosmological model for the observable universe from the earliest known periods through its subsequent large-scale evolution. The model describes how the universe expanded from an initial state of extremely high density and high temperature, and offers a comprehensive explanation for a broad range of observed phenomena, including the abundance of light elements, the cosmic microwave background (CMB) radiation, and large-scale structure.' },
        { type: 'h2', text: '1.1: Cosmic Inflation' },
        { type: 'p', text: 'Cosmic inflation is a theory of exponential expansion of space in the early universe. The inflationary epoch is believed to have lasted from 10^-36 seconds to somewhere between 10^-33 and 10^-32 seconds after the Big Bang. Following the inflationary period, the universe continued to expand, but at a less accelerated rate.' }
    ]
  },
  {
    title: "The History of Ancient Civilizations",
    content: [
        { type: 'h1', text: 'Chapter 1: Mesopotamia - The Cradle of Civilization' },
        { type: 'p', text: 'Mesopotamia is a historical region of Western Asia situated within the Tigris–Euphrates river system, in the northern part of the Fertile Crescent. It corresponds to most of modern-day Iraq, Kuwait, the eastern parts of Syria, Southeastern Turkey, and regions along the Turkish–Syrian and Iran–Iraq borders.' },
        { type: 'p', text: 'The Sumerians and Akkadians (including Assyrians and Babylonians) dominated Mesopotamia from the beginning of written history (c. 3100 BC) to the fall of Babylon in 539 BC, when it was conquered by the Achaemenid Empire. It fell to Alexander the Great in 332 BC, and after his death, it became part of the Greek Seleucid Empire.' },
    ]
  }
];

export function EbookReader({ slug }: { slug: string }) {
  const [book, setBook] = useState<{title: string, content: {type: string, text: string}[]} | null>(null);

  useEffect(() => {
    const foundBook = ebooks.find(b => slugify(b.title) === slug);
    setBook(foundBook || null);
  }, [slug]);

  if (!book) {
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

  const renderContent = () => {
    return book.content.map((item, index) => {
      switch (item.type) {
        case 'h1': return <h1 key={index} className="text-4xl font-bold mt-8 mb-4 !pb-2 !border-b-2">{item.text}</h1>;
        case 'h2': return <h2 key={index} className="text-2xl font-semibold mt-6 mb-3 !pb-1 !border-b">{item.text}</h2>;
        case 'p': return <p key={index} className="text-lg leading-relaxed">{item.text}</p>;
        default: return <p key={index}>{item.text}</p>;
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <Link href="/ebooks">
            <Button variant="ghost" size="icon">
                <ArrowLeft />
            </Button>
        </Link>
        <div className="flex-1 mx-4 truncate">
          <h1 className="text-lg font-semibold truncate">{book.title}</h1>
        </div>
        <SidebarTrigger />
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </main>
       <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t bg-background px-4 md:px-6">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Chapter
            </Button>
            <Button variant="outline">
                Next Chapter
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </footer>
    </div>
  );
}
