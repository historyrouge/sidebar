
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
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

const menuItems = [
    { name: "New Chat", icon: <MessageSquare className="size-4" />, href: "/" },
    { name: "Study Now", icon: <Sparkles className="size-4" />, href: "/study-now" },
    { name: "Create Flashcards", icon: <PlusSquare className="size-4" />, href: "/create-flashcards" },
    { name: "Code Agent", icon: <Code className="size-4" />, href: "/code-agent" },
    { name: "Your Material", icon: <Library className="size-4" />, href: "/materials" },
    { name: "eBooks", icon: <BookOpen className="size-4" />, href: "/ebooks" },
];

const footerMenuItems = [
    { name: "Profile", icon: <User className="size-4" />, href: "/profile" },
    { name: "Settings", icon: <Settings className="size-4" />, href: "/settings" },
    { name: "Help", icon: <HelpCircle className="size-4" />, href: "/help" },
    { name: "About Us", icon: <Info className="size-4" />, href: "/about" },
]

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loadingHref) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            router.push(loadingHref);
            setLoadingHref(null);
            setProgress(0);
            return 100;
          }
          return prev + 20;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [loadingHref, router]);

  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    if (pathname === href) {
        e.preventDefault();
        return;
    }
    e.preventDefault();
    setLoadingHref(href);
    setProgress(0);
    setOpenMobile(false);
  };

  const renderMenuItems = (items: typeof menuItems) => {
    return items.map((item) => (
        <SidebarMenuItem key={item.name}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                isActive={pathname === item.href}
                className="justify-start"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLinkClick(e, item.href)}
              >
                  <a>
                    {item.icon}
                    <span>{item.name}</span>
                    {loadingHref === item.href && (
                        <Progress value={progress} className="w-10 h-1 ml-auto" />
                    )}
                  </a>
              </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
    ));
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          {state === "expanded" && (
            <h1 className="text-lg font-semibold">ScholarSage</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
            {renderMenuItems(menuItems)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
           {renderMenuItems(footerMenuItems)}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
