
"use client";

import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  Info,
  Library,
  MessageSquare,
  PlusSquare,
  Settings,
  Sparkles,
  User,
  Youtube,
  FilePlus2,
  FileQuestion,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSidebar } from "./ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

const menuItems = [
    { name: "Chat", icon: <MessageSquare />, href: "/" },
    { name: "Study Now", icon: <Sparkles />, href: "/study-now" },
    { name: "Create Flashcards", icon: <PlusSquare />, href: "/create-flashcards" },
    { name: "Quiz", icon: <FileQuestion />, href: "/quiz" },
    { name: "YouTube Tools", icon: <Youtube />, href: "/youtube-extractor" },
    { name: "eBooks", icon: <BookOpen />, href: "/ebooks" },
    { name: "Settings", icon: <Settings />, href: "/settings" },
    { name: "Help", icon: <HelpCircle />, href: "/help" },
    { name: "About Us", icon: <Info />, href: "/about" },
];

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const renderMenuItems = (items: typeof menuItems) => {
    return items.map((item) => (
        <SidebarMenuItem key={item.name}>
            <Link href={item.href} className="w-full">
              <SidebarMenuButton
                tooltip={item.name}
                isActive={pathname === item.href}
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
        <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="size-5" />
                </div>
                <h1 className="text-lg font-semibold">LearnSphere</h1>
            </Link>
            <Button asChild variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden">
                <Link href="/study-now" >
                    <FilePlus2 />
                </Link>
            </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow">
        <SidebarMenu>
            {renderMenuItems(menuItems)}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
