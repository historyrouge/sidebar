
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { getStudyMaterialsAction } from "@/app/actions";
import { StudyMaterialWithId } from "@/lib/types";
import { PlusCircle, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

export function MaterialsContent() {
  const [materials, setMaterials] = useState<StudyMaterialWithId[]>([]);
  const [isLoading, startLoading] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startLoading(async () => {
      const result = await getStudyMaterialsAction();
      if (result.error) {
        toast({ title: "Failed to load materials", description: result.error, variant: 'destructive' });
      } else {
        setMaterials(result.data || []);
      }
    });
  }, [toast]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Your Study Materials</h1>
            <Link href="/study-now">
                <Button>
                    <PlusCircle className="mr-2" />
                    New Material
                </Button>
            </Link>
        </div>
        
        {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        ) : materials.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {materials.map(material => (
                    <Link href={`/study-now?id=${material.id}`} key={material.id}>
                        <Card className="hover:border-primary transition-colors">
                            <CardHeader>
                                <CardTitle className="truncate">{material.title}</CardTitle>
                                <CardDescription>
                                    Created {formatDistanceToNow(material.createdAt.toDate(), { addSuffix: true })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">{material.content}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">No materials yet</h2>
                <p className="text-muted-foreground mt-2">Click "New Material" to start studying.</p>
            </div>
        )}
      </div>
    </div>
  );
}
