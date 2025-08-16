
"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getUserProfileAction, updateUserProfile } from "@/app/actions";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  college: z.string().optional(),
  favoriteSubject: z.string().optional(),
});

export function ProfileContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", college: "", favoriteSubject: "" },
  });

  useEffect(() => {
    startLoading(async () => {
      const result = await getUserProfileAction();
      if (result.error) {
        toast({ title: "Failed to load profile", description: result.error, variant: 'destructive' });
      } else if (result.data) {
        setProfile(result.data);
        form.reset({
            name: result.data.name,
            college: result.data.college,
            favoriteSubject: result.data.favoriteSubject,
        });
      }
    });
  }, [toast, form]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    startSaving(async () => {
        const result = await updateUserProfile(data);
        if(result.error) {
            toast({ title: "Failed to update profile", description: result.error, variant: 'destructive'});
        } else {
            toast({ title: "Profile updated successfully!" });
        }
    });
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
        <div className="mx-auto max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information here.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user?.photoURL || undefined} alt={profile?.name || ""} />
                                    <AvatarFallback className="text-3xl">{getInitials(profile?.name)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1.5">
                                    <h2 className="text-2xl font-bold">{profile?.name}</h2>
                                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="college"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>College/School</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Harvard University" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="favoriteSubject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Favorite Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Computer Science" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="flex justify-end">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
