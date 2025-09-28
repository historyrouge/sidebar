
"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Save, Loader2 } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { useToast } from "@/hooks/use-toast";

export function SettingsPersonalizeContent() {
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedName = localStorage.getItem("userName");
            const storedStatus = localStorage.getItem("userStatus");
            if (storedName) setName(storedName);
            if (storedStatus) setStatus(storedStatus);
        } catch (e) {
            console.warn("Could not access localStorage.");
        }
    }, []);

    const handleSave = () => {
        setIsLoading(true);
        try {
            localStorage.setItem("userName", name || "Guest");
            localStorage.setItem("userStatus", status || "Using SearnAI");
            toast({
                title: "Profile Saved!",
                description: "Your personalization settings have been updated.",
            });
        } catch (e) {
            toast({
                title: "Error Saving",
                description: "Could not save settings to local storage.",
                variant: "destructive",
            });
        }
        setTimeout(() => setIsLoading(false), 500); // Simulate save
    };

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Personalize</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Profile</CardTitle>
                            <CardDescription>This information is stored only in your browser.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Alex Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="What are you working on?" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}
