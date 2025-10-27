"use client";

import { Users } from "lucide-react";

export function FriendsContent() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 p-4 md:p-8">
      <div className="text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">Friends Feature Disabled</h2>
        <p className="mt-2 text-muted-foreground">User accounts are no longer required to use this application.</p>
      </div>
    </div>
  );
}
