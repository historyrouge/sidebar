
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/main-layout";

const NotFoundLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <title>Easy Learn AI Logo</title>
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z"/>
        <path d="M4.2 11.27L12 8.5l7.8 2.77"/>
        <path d="M12 20v-7.5"/>
        <path d="M11.5 6.5L6.25 8.25l5.5 2.25 5.5-2.25L12.5 6.5c-.25-.1-.75-.1-1 0z"/>
    </svg>
);


export default function NotFound() {
  return (
    <MainLayout>
        <div className="flex h-full flex-col">
            <main className="flex-1 flex flex-col items-center justify-center bg-background text-foreground p-4">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-4 text-2xl font-medium text-muted-foreground">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">404</h1>
                        <div className="border-l border-border h-12"></div>
                        <p>This page could not be found.</p>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                        Sorry, we couldn’t find the page you’re looking for.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/">
                            <Button>Go back home</Button>
                        </Link>
                         <Link href="/help">
                            <Button variant="outline">Contact support</Button>
                        </Link>
                    </div>
                </div>
            </main>
             <footer className="p-4">
                <Link href="/" className="fixed bottom-5 left-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <NotFoundLogo className="size-5" />
                    </div>
                </Link>
            </footer>
        </div>
    </MainLayout>
  );
}
