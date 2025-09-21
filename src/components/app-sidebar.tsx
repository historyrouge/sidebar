"use client";

import {
  Bell,
  BookOpen,
  HelpCircle,
  Home,
  Info,
  Plus,
  Search,
  Settings,
  Code,
  FileQuestion,
  Youtube,
  Rss,
  User,
  MoreHorizontal,
  GraduationCap,
  BrainCircuit,
  FileText,
  Layers,
  MessageSquare,
  Cpu,
  Presentation,
  File,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useSidebar } from "./ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const studyTools = [
    { name: "Home", icon: <Home />, href: "/" },
    { name: "Study Session", icon: <GraduationCap />, href: "/study-now" },
    { name: "Code Analyzer", icon: <Code />, href: "/code-analyzer" },
    { name: "Create Flashcards", icon: <Plus />, href: "/create-flashcards" },
    { name: "Quiz", icon: <FileQuestion />, href: "/quiz" },
    { name: "Mind Map", icon: <BrainCircuit />, href: "/mind-map" },
    { name: "Question Paper", icon: <FileText />, href: "/question-paper" },
    { name: "Presentation Maker", icon: <Presentation />, href: "/presentation-maker" },
];

const resources = [
    { name: "YouTube Tools", icon: <Youtube />, href: "/youtube-extractor" },
    { name: "News", icon: <Rss />, href: "/news" },
    { name: "eBooks", icon: <BookOpen />, href: "/ebooks" },
    { name: "PDF Hub", icon: <File />, href: "/pdf-hub" },
    { name: "AI Training", icon: <Cpu />, href: "/ai-training" },
];

const account = [
    { name: "Settings", icon: <Settings />, href: "/settings" },
    { name: "Help", icon: <HelpCircle />, href: "/help" },
    { name: "About Us", icon: <Info />, href: "/about" },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const renderMenuItems = (items: {name: string, icon: React.ReactNode, href: string}[]) => {
    return items.map((item) => (
        <SidebarMenuItem key={item.name}>
            <Link href={item.href} className="w-full">
              <SidebarMenuButton
                tooltip={item.name}
                isActive={pathname === item.href}
                className={cn(
                    "justify-start w-full gap-2 px-3",
                    pathname === item.href && "bg-sidebar-active text-sidebar-active-foreground font-semibold"
                )}
                onClick={handleLinkClick}
              >
                  <div className="transition-transform duration-200 group-hover/menu-button:scale-110">
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
              </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
    ));
  }

  return (
    <Sidebar className="shadow-[2px_0_8px_rgba(0,0,0,0.03)] dark:shadow-none border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Layers className="size-5" />
            </div>
            <h1 className="text-lg font-semibold">Easy Learn AI</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow flex flex-col">
        <div className="flex-grow">
            <SidebarMenu>
                <SidebarGroupLabel className="uppercase text-xs font-semibold text-sidebar-group-foreground tracking-wider px-3 my-2 text-gray-500">Study Tools</SidebarGroupLabel>
                {renderMenuItems(studyTools)}
            </SidebarMenu>
            
            <SidebarSeparator className="my-2" />
            
            <SidebarMenu>
                 <SidebarGroupLabel className="uppercase text-xs font-semibold text-sidebar-group-foreground tracking-wider px-3 my-2 text-gray-500">Resources</SidebarGroupLabel>
                 {renderMenuItems(resources)}
            </SidebarMenu>
            <SidebarSeparator className="my-2" />
            <SidebarMenu>
                 <SidebarGroupLabel className="uppercase text-xs font-semibold text-sidebar-group-foreground tracking-wider px-3 my-2 text-gray-500">Account</SidebarGroupLabel>
                 {renderMenuItems(account)}
            </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
