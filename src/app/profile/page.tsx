
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserProfileAction, updateUserProfile } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [college, setCollege] = useState("");
    const [favoriteSubject, setFavoriteSubject] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getUserProfileAction()
                .then(result => {
                    if (result.error) {
                        toast({ title: "Error", description: result.error, variant: "destructive" });
                    } else if (result.data) {
                        setName(result.data.name || user.displayName || "");
                        setCollege(result.data.college || "");
                        setFavoriteSubject(result.data.favoriteSubject || "");
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, toast]);

    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        const names = name.split(' ');
        if (names.length > 1) {
          return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    }

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateUserProfile({ name, college, favoriteSubject });
        if (result.error) {
            toast({ title: "Error saving profile", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Your profile has been updated." });
        }
        setIsSaving(false);
    };

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
                    <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>View and manage your profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                                <AvatarFallback className="text-3xl">{getInitials(name)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">{name || "Anonymous User"}</h2>
                                <p className="text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="college">College/Class</Label>
                                    <Input id="college" value={college} onChange={(e) => setCollege(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="favoriteSubject">Favorite Subject</Label>
                                    <Input id="favoriteSubject" value={favoriteSubject} onChange={(e) => setFavoriteSubject(e.target.value)} />
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end">
                            <Button onClick={handleSave} disabled={isLoading || isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
