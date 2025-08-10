
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

const menuItems = [
    { name: "New Chat", icon: <PlusCircle className="size-4" /> },
    { name: "Your Material", icon: <Library className="size-4" /> },
    { name: "eBooks", icon: <BookOpen className="size-4" /> },
];

const footerMenuItems = [
    { name: "Help", icon: <HelpCircle className="size-4" /> },
    { name: "About Us", icon: <Info className="size-4" /> },
]

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();

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
                    <SidebarMenuButton tooltip={item.name} isActive={item.name === 'New Chat'} className="justify-start" onClick={handleMobileClick}>
                        {item.icon}
                        <span>{item.name}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
           {footerMenuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton tooltip={item.name} className="justify-start" onClick={handleMobileClick}>
                        {item.icon}
                        <span>{item.name}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
           ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
