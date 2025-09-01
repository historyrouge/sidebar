
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

const menuItems = [
    { name: "Home", icon: <Home />, href: "/" },
    { name: "Study Session", icon: <GraduationCap />, href: "/study-now" },
    { name: "Code Analyzer", icon: <Code />, href: "/code-analyzer" },
    { name: "Create Flashcards", icon: <Plus />, href: "/create-flashcards" },
    { name: "Quiz", icon: <FileQuestion />, href: "/quiz" },
    { name: "Mind Map", icon: <BrainCircuit />, href: "/mind-map" },
    { name: "Question Paper", icon: <FileText />, href: "/question-paper" },
    { name: "YouTube Tools", icon: <Youtube />, href: "/youtube-extractor" },
    { name: "News", icon: <Rss />, href: "/news" },
    { name: "eBooks", icon: <BookOpen />, href: "/ebooks" },
];

const bottomMenuItems = [
    { name: "Settings", icon: <Settings />, href: "/settings" },
    { name: "Help", icon: <HelpCircle />, href: "/help" },
    { name: "About Us", icon: <Info />, href: "/about" },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const [lastChat, setLastChat] = useState<{title: string, href: string} | null>(null);

  useEffect(() => {
    // This is a simplified example. In a real app, you'd fetch a list of chats.
    try {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            const history = JSON.parse(savedHistory);
            if (history.length > 0) {
                const firstUserMessage = history.find((m: any) => m.role === 'user');
                setLastChat({
                    title: firstUserMessage ? firstUserMessage.content.substring(0, 25) + '...' : "Last Chat",
                    href: "/" // All chats point home for now
                });
            }
        }
    } catch (e) {
        console.error("Could not load chat history for sidebar", e);
    }
  }, [pathname]);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const renderMenuItems = (items: {name: string, icon: React.ReactNode, href: string}[]) => {
    return items.map((item) => (
        <SidebarMenuItem key={item.name}>
            <Link href={item.href} className="w-full">
              <SidebarMenuButton
                tooltip={item.name}
                isActive={pathname === item.href && !lastChat}
                className="justify-start w-full"
                onClick={handleLinkClick}
              >
                  {item.icon}
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
                <BookOpen className="size-5" />
            </div>
            <h1 className="text-lg font-semibold">Easy Learn AI</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow flex flex-col">
        <div className="flex-grow">
            <SidebarMenu>
                {renderMenuItems(menuItems.slice(0,1))}
            </SidebarMenu>
            
            {lastChat && (
                <SidebarGroup>
                    <SidebarGroupLabel>Previous Chats</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                             <Link href={lastChat.href} className="w-full">
                                <SidebarMenuButton
                                    tooltip={lastChat.title}
                                    isActive={pathname === lastChat.href}
                                    className="justify-start w-full"
                                    onClick={handleLinkClick}
                                >
                                    <MessageSquare />
                                    <span>{lastChat.title}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            )}

            <SidebarSeparator className="my-2" />
            
            <SidebarMenu>
                {renderMenuItems(menuItems.slice(1))}
            </SidebarMenu>
            <SidebarSeparator className="my-2" />
            <SidebarMenu>
                 {renderMenuItems(bottomMenuItems)}
            </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
