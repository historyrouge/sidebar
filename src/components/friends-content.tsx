
"use client";

import { Users, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

// Dummy data for now. In the future, this will come from Firestore.
const dummyUsers = [
    { id: '1', name: 'Harsh', avatar: 'https://placehold.co/40x40.png', isFollowing: false, aiHint: "profile picture" },
    { id: '2', name: 'Alex', avatar: 'https://placehold.co/40x40.png', isFollowing: true, aiHint: "profile picture" },
    { id: '3', name: 'Priya', avatar: 'https://placehold.co/40x40.png', isFollowing: false, aiHint: "profile picture" },
];

export function FriendsContent() {
  return (
    <div className="flex flex-1 flex-col bg-muted/40 p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-2xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Connect with Friends</h1>
                <p className="text-muted-foreground mt-1">Search for users and manage your connections.</p>
            </header>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for users..." className="w-full pl-10 h-11" />
            </div>

            <Card>
                <CardContent className="p-4">
                    <ul className="space-y-3">
                        {dummyUsers.map(user => (
                             <li key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.aiHint} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold">{user.name}</span>
                                </div>
                                <Button variant={user.isFollowing ? 'secondary' : 'default'}>
                                    {user.isFollowing ? 'Following' : 'Follow'}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
