
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
  Brush,
  Volume2,
  FileEdit,
  LogOut,
  Globe,
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
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const studyTools = [
    { name: "Study Session", icon: <GraduationCap />, href: "/study-now" },
    { name: "AI Editor", icon: <Brush />, href: "/ai-editor" },
    { name: "Code Analyzer", icon: <Code />, href: "/code-analyzer" },
    { name: "Flashcards", icon: <Layers />, href: "/create-flashcards" },
    { name: "Quiz", icon: <FileQuestion />, href: "/quiz" },
    { name: "Mind Map", icon: <BrainCircuit />, href: "/mind-map" },
    { name: "Question Paper", icon: <FileText />, href: "/question-paper" },
    { name: "Presentation Maker", icon: <Presentation />, href: "/presentation-maker" },
];

const resources = [
    { name: "Web Browser", icon: <Globe />, href: "/web-browser" },
    { name: "YouTube Tools", icon: <Youtube />, href: "/youtube-extractor" },
    { name: "News", icon: <Rss />, href: "/news" },
    { name: "eBooks", icon: <BookOpen />, href: "/ebooks" },
    { name: "Text-to-Speech", icon: <Volume2 />, href: "/text-to-speech" },
    { name: "AI Training", icon: <Cpu />, href: "/ai-training" },
];

const mainNav = [
    { name: "Home", icon: <Home />, href: "/" },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const { user, logout } = useAuth();
  const currentPathname = usePathname();
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(currentPathname);
  }, [currentPathname]);


  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const handleNewChat = () => {
    handleLinkClick();
    try {
        if (pathname === '/') {
            localStorage.removeItem('chatHistory');
            sessionStorage.removeItem('chatScrollPosition');
            window.location.reload();
        } else {
            router.push('/');
        }
    } catch (e) {
        console.error("Could not clear storage", e);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }


  const renderMenuItems = (items: {name: string, icon: React.ReactNode, href: string}[]) => {
    return items.map((item) => (
        <SidebarMenuItem key={item.name}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                tooltip={item.name}
                isActive={pathname === item.href}
                className="justify-start w-full gap-2.5 px-3 focus-ring transition-smooth"
                onClick={handleLinkClick}
                aria-label={`Navigate to ${item.name}`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                  <div className="transition-transform duration-200 group-hover/menu-button:scale-110" aria-hidden="true">
                    {item.icon}
                  </div>
                  <span className="text-sm">{item.name}</span>
              </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
    ));
  }

  return (
    <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-64 sm:w-72" role="navigation" aria-label="Main navigation">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5 focus-ring rounded-lg p-1 -m-1" aria-label="ScholarSage - Go to home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
                <Layers className="size-5" />
            </div>
            <h1 className="text-lg font-semibold">ScholarSage</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow flex flex-col">
        <div className="flex-grow">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={handleNewChat}
                        className="justify-start w-full gap-2.5 px-3 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 focus-ring"
                        aria-label="Start a new chat session"
                    >
                        <FileEdit aria-hidden="true" />
                        <span className="text-sm">New Chat</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 {renderMenuItems(mainNav)}
            </SidebarMenu>
            
            <SidebarSeparator className="my-4" />
            
            <SidebarMenu>
                 <SidebarGroupLabel className="uppercase text-xs font-semibold tracking-wider px-3 my-2 text-sidebar-group-foreground">Study Tools</SidebarGroupLabel>
                 {renderMenuItems(studyTools)}
            </SidebarMenu>

            <SidebarSeparator className="my-4" />

            <SidebarMenu>
                 <SidebarGroupLabel className="uppercase text-xs font-semibold tracking-wider px-3 my-2 text-sidebar-group-foreground">Resources</SidebarGroupLabel>
                 {renderMenuItems(resources)}
            </SidebarMenu>
        </div>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/settings">
                        <SidebarMenuButton 
                            className="w-full justify-start gap-2.5 px-3 focus-ring transition-smooth" 
                            isActive={pathname.startsWith('/settings')}
                            aria-label="Open settings"
                            aria-current={pathname.startsWith('/settings') ? "page" : undefined}
                        >
                            <Settings aria-hidden="true" />
                            <span className="text-sm">Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/about">
                        <SidebarMenuButton 
                            className="w-full justify-start gap-2.5 px-3 focus-ring transition-smooth" 
                            isActive={pathname === '/about'}
                            aria-label="Learn about ScholarSage"
                            aria-current={pathname === '/about' ? "page" : undefined}
                        >
                            <Info aria-hidden="true" />
                             <span className="text-sm">About Us</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={handleLogout} 
                        className="w-full justify-start gap-2.5 px-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 focus-ring transition-smooth"
                        aria-label="Sign out of your account"
                    >
                        <LogOut aria-hidden="true" />
                        <span className="text-sm">Log Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
