
"use client";

import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  Info,
  Library,
  PlusCircle,
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

const menuItems = [
    { name: "New Chat", icon: <PlusCircle className="size-4" />, href: "/" },
    { name: "Your Material", icon: <Library className="size-4" />, href: "/materials" },
    { name: "eBooks", icon: <BookOpen className="size-4" />, href: "/ebooks" },
];

const footerMenuItems = [
    { name: "Help", icon: <HelpCircle className="size-4" />, href: "/help" },
    { name: "About Us", icon: <Info className="size-4" />, href: "/about" },
]

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleMobileClick = () => {
    setOpenMobile(false);
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
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                    <Link href={item.href} passHref legacyBehavior>
                      <SidebarMenuButton asChild tooltip={item.name} isActive={pathname === item.href} className="justify-start" onClick={handleMobileClick}>
                          <a>
                            {item.icon}
                            <span>{item.name}</span>
                          </a>
                      </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
           {footerMenuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                    <Link href={item.href} passHref legacyBehavior>
                      <SidebarMenuButton asChild tooltip={item.name} isActive={pathname === item.href} className="justify-start" onClick={handleMobileClick}>
                          <a>
                            {item.icon}
                            <span>{item.name}</span>
                          </a>
                      </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
           ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
