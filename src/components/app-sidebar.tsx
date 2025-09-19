
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

const studyTools = [
    { name: "Home", icon: <Home />, href: "/" },
    { name: "Study Session", icon: <GraduationCap />, href: "/study-now" },
    { name: "Code Analyzer", icon: <Code />, href: "/code-analyzer" },
    { name: "Create Flashcards", icon: <Plus />, href: "/create-flashcards" },
    { name: "Quiz", icon: <FileQuestion />, href: "/quiz" },
    { name: "Mind Map", icon: <BrainCircuit />, href: "/mind-map" },
    { name: "Question Paper", icon: <FileText />, href: "/question-paper" },
];

const resources = [
    { name: "YouTube Tools", icon: <Youtube />, href: "/youtube-extractor" },
    { name: "News", icon: <Rss />, href: "/news" },
    { name: "eBooks", icon: <BookOpen />, href: "/ebooks" },
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
                className="justify-start w-full"
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
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Layers className="size-5" />
            </div>
            <h1 className="text-lg font-semibold">Easy Learn AI</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow flex flex-col">
        <div className="flex-grow">
            <SidebarMenu>
                <SidebarGroupLabel>Study Tools</SidebarGroupLabel>
                {renderMenuItems(studyTools)}
            </SidebarMenu>
            
            <SidebarSeparator className="my-2" />
            
            <SidebarMenu>
                 <SidebarGroupLabel>Resources</SidebarGroupLabel>
                 {renderMenuItems(resources)}
            </SidebarMenu>
            <SidebarSeparator className="my-2" />
            <SidebarMenu>
                 <SidebarGroupLabel>Account</SidebarGroupLabel>
                 {renderMenuItems(account)}
            </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
