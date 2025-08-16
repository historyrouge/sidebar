
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Check, LogOut, Loader2, Moon, Plus, Settings, Sun, User, UserPlus, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";
import { useEffect, useState, useTransition } from "react";
import { getFriendsAction, manageFriendRequestAction, sendFriendRequestAction } from "@/app/actions";
import type { Friend } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

export function FriendsContent() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, startLoading] = useTransition();
    const [isActionLoading, startActionLoading] = useTransition();
    const [friendEmail, setFriendEmail] = useState("");
    const { toast } = useToast();

    const fetchFriends = async () => {
        startLoading(async () => {
            const result = await getFriendsAction();
            if (result.error) {
                toast({ title: "Error fetching friends", description: result.error, variant: 'destructive' });
            } else {
                setFriends(result.data || []);
            }
        });
    };

    useEffect(() => {
        if(user) {
            fetchFriends();
        }
    }, [user]);

    const handleAddFriend = async () => {
        if (!friendEmail) return;
        startActionLoading(async () => {
            const result = await sendFriendRequestAction(friendEmail);
            if (result.error) {
                toast({ title: "Failed to send request", description: result.error, variant: 'destructive' });
            } else {
                toast({ title: "Friend request sent!", description: `Your request to ${friendEmail} has been sent.` });
                setFriendEmail("");
                fetchFriends(); // Refresh the list
            }
        });
    };
    
    const handleManageRequest = async (friendId: string, action: 'accept' | 'decline') => {
        startActionLoading(async () => {
            const result = await manageFriendRequestAction(friendId, action);
             if (result.error) {
                toast({ title: `Failed to ${action} request`, description: result.error, variant: 'destructive' });
            } else {
                toast({ title: "Success", description: `Friend request has been ${action === 'accept' ? 'accepted' : 'declined'}.` });
                fetchFriends(); // Refresh the list
            }
        });
    }


    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    }
    
    const pendingRequests = friends.filter(f => f.status === 'pending');
    const acceptedFriends = friends.filter(f => f.status === 'accepted');
    const requestedFriends = friends.filter(f => f.status === 'requested');

    const renderFriendList = (list: Friend[], type: 'accepted' | 'pending' | 'requested') => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-10 w-full" /></div>
                    <div className="flex items-center justify-between gap-4"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-10 w-full" /></div>
                </div>
            )
        }

        if (list.length === 0) {
            if (type === 'accepted') return <p className="text-sm text-center text-muted-foreground py-4">You haven't added any friends yet.</p>;
            if (type === 'pending') return <p className="text-sm text-center text-muted-foreground py-4">No new friend requests.</p>;
            if (type === 'requested') return <p className="text-sm text-center text-muted-foreground py-4">No pending sent requests.</p>;
            return null;
        }

        return (
            <div className="space-y-2">
                {list.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={friend.photoURL || undefined} alt={friend.name} data-ai-hint="person" />
                                <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold">{friend.name}</div>
                                <div className="text-sm text-muted-foreground">{friend.email}</div>
                            </div>
                        </div>
                        {type === 'pending' && (
                             <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleManageRequest(friend.id, 'accept')} disabled={isActionLoading}><Check className="text-green-500" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleManageRequest(friend.id, 'decline')} disabled={isActionLoading}><X className="text-red-500" /></Button>
                            </div>
                        )}
                         {type === 'accepted' && <Button variant="outline" size="sm" disabled>Start Quiz</Button>}
                         {type === 'requested' && <Button variant="ghost" size="sm" disabled>Pending</Button>}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-xl font-semibold tracking-tight">Friends</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{user?.email || "My Account"}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/profile" passHref>
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/settings" passHref>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
               <div className="grid gap-6 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Add a Friend</CardTitle>
                        <CardDescription>Connect with other ScholarSage users by sending a friend request.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input placeholder="Enter friend's email" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} disabled={isActionLoading} />
                            <Button onClick={handleAddFriend} disabled={isActionLoading || !friendEmail}>
                                {isActionLoading ? <Loader2 className="mr-2 animate-spin" /> : <UserPlus className="mr-2"/>} Add Friend
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {pendingRequests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Requests</CardTitle>
                            <CardDescription>Accept or decline requests from other users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {renderFriendList(pendingRequests, 'pending')}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Your Friends</CardTitle>
                         <CardDescription>Challenge your friends to a quiz!</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {renderFriendList(acceptedFriends, 'accepted')}
                    </CardContent>
                </Card>

                 {requestedFriends.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sent Requests</CardTitle>
                            <CardDescription>These are the requests you've sent that haven't been accepted yet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderFriendList(requestedFriends, 'requested')}
                        </CardContent>
                    </Card>
                )}

               </div>
            </main>
        </div>
    )
}
