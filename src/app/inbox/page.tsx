"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/main-layout";
import { BackButton } from "@/components/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Inbox, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Email {
  id: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
  };
}

const getHeader = (headers: { name: string; value: string }[], name: string) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : 'N/A';
};


export default function InboxPage() {
    const { user } = useAuth();
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmails = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/gmail', {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch emails.');
            }

            const data = await response.json();
            setEmails(data.emails);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEmails();
        }
    }, [user]);

    return (
        <MainLayout>
             <div className="flex flex-col h-full bg-muted/40">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="lg:hidden" />
                        <BackButton />
                        <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
                    </div>
                     <Button variant="outline" onClick={fetchEmails} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-3xl">
                        {loading ? (
                             <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : error ? (
                             <Card className="bg-destructive/10 border-destructive">
                                 <CardHeader>
                                     <CardTitle className="flex items-center gap-2 text-destructive">
                                         <AlertTriangle /> Could Not Load Inbox
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <p>{error}</p>
                                     <p className="text-sm text-muted-foreground mt-2">This can happen if you haven't granted Gmail permissions during sign-in, or if the API access is not configured correctly. Please try signing out and signing back in.</p>
                                 </CardContent>
                             </Card>
                        ) : emails.length > 0 ? (
                           <Card>
                                <CardHeader>
                                    <CardTitle>Your Latest Emails</CardTitle>
                                    <CardDescription>Showing the most recent messages from your Gmail inbox.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {emails.map((email, index) => (
                                            <div key={email.id}>
                                                <div className="p-3 rounded-lg hover:bg-muted/50">
                                                    <div className="font-semibold text-sm">{getHeader(email.payload.headers, 'From')}</div>
                                                    <div className="font-medium">{getHeader(email.payload.headers, 'Subject')}</div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{email.snippet}</p>
                                                </div>
                                                {index < emails.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                           </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-64">
                                <Inbox className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold text-foreground">Inbox is empty</h3>
                                <p className="text-sm">We couldn't find any emails.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}