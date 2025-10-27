
"use client";

import { Users, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";

// Dummy data for now. In the future, this will come from Firestore.
const dummyUsers = [
    { id: '1', name: 'Harsh', avatar: 'https://placehold.co/40x40.png', isFollowing: false, mutuals: 2, aiHint: "profile picture" },
    { id: '2', name: 'Alex', avatar: 'https://placehold.co/40x40.png', isFollowing: true, mutuals: 5, aiHint: "profile picture" },
    { id: '3', name: 'Priya', avatar: 'https://placehold.co/40x40.png', isFollowing: false, mutuals: 0, aiHint: "profile picture" },
];

const FriendCard = ({ user }: { user: (typeof dummyUsers)[0] }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.aiHint} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <div className="font-semibold">{user.name}</div>
                    {user.mutuals > 0 && <div className="text-xs text-muted-foreground">{user.mutuals} mutuals</div>}
                </div>
                <Button variant={user.isFollowing ? 'secondary' : 'default'} size="sm">
                    {user.isFollowing ? 'Following' : 'Follow'}
                </Button>
            </div>
        </div>
    </div>
);


export function FriendsContent() {
  return (
    <div className="flex flex-col h-full bg-muted/40">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">Friends</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-2xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Connect with Friends</h1>
                    <p className="text-muted-foreground mt-1">Search for users and manage your connections.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search for users by username..." className="w-full pl-10 h-11" />
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Suggestions</CardTitle>
                        <CardDescription>People you might know.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="space-y-1">
                            {dummyUsers.map(user => (
                                <FriendCard key={user.id} user={user} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
