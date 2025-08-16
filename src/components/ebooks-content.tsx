
"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { BookOpen } from "lucide-react";

export function EbooksContent() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 p-4 md:p-8">
      <div className="text-center">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">eBooks Coming Soon!</h2>
        <p className="mt-2 text-muted-foreground">This section is under construction. Check back later!</p>
      </div>
    </div>
  );
}
