
"use client";

import {
  BookOpen,
  Code,
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
    { name: "Chat", icon: <MessageSquare className="size-4" />, href: "/" },
    { name: "Study Now", icon: <Sparkles className="size-4" />, href: "/study-now" },
    { name: "Create Flashcards", icon: <PlusSquare className="size-4" />, href: "/create-flashcards" },
    { name: "Quiz", icon: <FileQuestion className="size-4" />, href: "/quiz" },
    { name: "Code Agent", icon: <Code className="size-4" />, href: "/code-agent" },
    { name: "YouTube Tools", icon: <Youtube className="size-4" />, href: "/youtube-extractor" },
    { name: "Your Material", icon: <Library className="size-4" />, href: "/materials" },
    { name: "Friends", icon: <Users className="size-4" />, href: "/friends" },
    { name: "eBooks", icon: <BookOpen className="size-4" />, href: "/ebooks" },
];

const footerMenuItems = [
    { name: "Profile", icon: <User className="size-4" />, href: "/profile" },
    { name: "Settings", icon: <Settings className="size-4" />, href: "/settings" },
    { name: "Help", icon: <HelpCircle className="size-4" />, href: "/help" },
    { name: "About Us", icon: <Info className="size-4" />, href: "/about" },
]

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
                <h1 className="text-lg font-semibold">ScholarSage</h1>
            </Link>
            <Button asChild variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden">
                <Link href="/" >
                    <FilePlus2 />
                </Link>
            </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
            {renderMenuItems(menuItems)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto p-2 pb-4">
        <SidebarMenu>
           {renderMenuItems(footerMenuItems)}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
