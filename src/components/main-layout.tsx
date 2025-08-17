
"use client";

import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { NextNProgressClient } from "./nprogress-client";
import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't render sidebar for the quiz start page
  if (pathname === '/quiz/start') {
    return (
      <>
        <NextNProgressClient />
        {children}
      </>
    )
  }

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <NextNProgressClient />
          {children}
        </SidebarInset>
      </SidebarProvider>
  );
}
