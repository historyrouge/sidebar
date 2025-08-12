
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, Inbox, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStudyMaterialsAction } from "../actions";
import { StudyMaterialWithId } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MainLayout } from "@/components/main-layout";

function MaterialsContent() {
    const [materials, setMaterials] = useState<StudyMaterialWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchMaterials = async () => {
            const result = await getStudyMaterialsAction();
            if (result.error) {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            } else {
                // Sort materials by creation date, newest first
                const sortedMaterials = result.data?.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                }) || [];
                setMaterials(sortedMaterials);
            }
            setLoading(false);
        };
        fetchMaterials();
    }, [toast]);

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
                    <h1 className="text-xl font-semibold tracking-tight">Your Material</h1>
                </div>
                <Button asChild>
                    <Link href="/study-now">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Material
                    </Link>
                </Button>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Uploaded Materials</CardTitle>
                        <CardDescription>A list of all the content you've saved.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                                <Inbox className="w-16 h-16 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">You haven't uploaded any materials yet.</p>
                                <Button className="mt-4" asChild>
                                    <Link href="/study-now">Add Material</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {materials.map((material) => (
                                    <Link key={material.id} href={`/study-now?id=${material.id}`} passHref>
                                        <div className="block border p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                            <h3 className="font-semibold text-lg">{material.title}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{material.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {material.createdAt ? formatDistanceToNow(new Date(material.createdAt.seconds * 1000), { addSuffix: true }) : 'Date not available'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default function MaterialsPage() {
    return (
        <MainLayout>
            <MaterialsContent />
        </MainLayout>
    )
}
