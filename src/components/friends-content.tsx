
"use client";

import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type User = {
    id: string;
    name: string;
    avatar: string;
    isFollowing: boolean;
    mutuals: number;
    aiHint?: string;
};

const FriendCard = ({ user, onFollowToggle, isLoading }: { user: User, onFollowToggle: (userId: string, isFollowing: boolean) => void, isLoading: boolean }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.aiHint} />
            <AvatarFallback>{user.name ? user.name.charAt(0) : '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <div className="font-semibold">{user.name || 'Anonymous User'}</div>
                    {user.mutuals > 0 && <div className="text-xs text-muted-foreground">{user.mutuals} mutuals</div>}
                </div>
                <Button 
                    variant={user.isFollowing ? 'secondary' : 'default'} 
                    size="sm"
                    onClick={() => onFollowToggle(user.id, user.isFollowing)}
                    disabled={isLoading}
                >
                    {user.isFollowing ? 'Following' : 'Follow'}
                </Button>
            </div>
        </div>
    </div>
);


export function FriendsContent() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchUsers = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersList = await Promise.all(
                usersSnapshot.docs
                    .filter(doc => doc.id !== currentUser.uid) // Exclude current user
                    .map(async (doc) => {
                        const userData = doc.data();
                        const followDocRef = doc(db, "users", currentUser.uid, "following", doc.id);
                        const followDoc = await getDoc(followDocRef);
                        
                        return {
                            id: doc.id,
                            name: userData.name || userData.displayName || "Anonymous",
                            avatar: userData.photoURL || `https://placehold.co/40x40.png`,
                            isFollowing: followDoc.exists(),
                            mutuals: 0, // Mutuals logic to be implemented later
                            aiHint: "profile picture"
                        };
                    })
            );
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users: ", error);
            toast({
                title: "Error",
                description: "Could not fetch users. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    fetchUsers();
  }, [currentUser, toast]);
  
  const handleFollowToggle = async (userIdToToggle: string, isCurrentlyFollowing: boolean) => {
      if (!currentUser) return;
      
      setFollowLoading(prev => ({...prev, [userIdToToggle]: true}));

      const followDocRef = doc(db, "users", currentUser.uid, "following", userIdToToggle);

      try {
          if (isCurrentlyFollowing) {
              await deleteDoc(followDocRef);
              toast({ title: "Unfollowed", description: "You are no longer following this user." });
          } else {
              await setDoc(followDocRef, { followedAt: new Date() });
              toast({ title: "Followed!", description: "You are now following this user." });
          }
          // Update UI instantly
          setUsers(prevUsers => prevUsers.map(u => 
              u.id === userIdToToggle ? { ...u, isFollowing: !isCurrentlyFollowing } : u
          ));
      } catch (error) {
          console.error("Error updating follow status: ", error);
          toast({ title: "Error", description: "Could not update follow status.", variant: "destructive" });
      } finally {
          setFollowLoading(prev => ({...prev, [userIdToToggle]: false}));
      }
  };


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
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8">
                                <p>No other users found.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {users.map(user => (
                                    <FriendCard 
                                        key={user.id} 
                                        user={user} 
                                        onFollowToggle={handleFollowToggle}
                                        isLoading={followLoading[user.id] || false}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
