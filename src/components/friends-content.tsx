
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Moon, Plus, Settings, Sun, User, UserPlus } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";

const friends = [
    { name: "John Doe", email: "john@example.com", avatar: "https://placehold.co/100x100.png" },
    { name: "Jane Smith", email: "jane@example.com", avatar: "https://placehold.co/100x100.png" },
    { name: "Sam Wilson", email: "sam@example.com", avatar: "https://placehold.co/100x100.png" },
];

export function FriendsContent() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const getInitials = (name?: string | null) => {
        if (!name) return "SS";
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
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
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
               <Card>
                <CardHeader>
                    <CardTitle>Friend List</CardTitle>
                    <CardDescription>Manage your connections and see who you can study with.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Input placeholder="Enter friend's email to add..." />
                        <Button><UserPlus className="mr-2"/> Add Friend</Button>
                    </div>
                    <div className="space-y-4">
                        {friends.map((friend) => (
                             <div key={friend.email} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={friend.avatar} alt={friend.name} data-ai-hint="person" />
                                        <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold">{friend.name}</div>
                                        <div className="text-sm text-muted-foreground">{friend.email}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Remove</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
               </Card>
            </main>
        </div>
    )
}
