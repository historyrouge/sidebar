
"use client";

import { Library } from "lucide-react";

export function MaterialsContent() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-1 items-center justify-center bg-muted/40 p-4 md:p-8 h-full rounded-lg">
            <div className="text-center">
                <Library className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">Saved Materials Disabled</h2>
                <p className="mt-2 text-muted-foreground">User accounts are no longer required, so saving materials is disabled.</p>
            </div>
        </div>
    </div>
  );
}
