"use client";

import {
  Book,
  FileText,
  GraduationCap,
  PlusCircle,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

const subjects = [
  {
    name: "Quantum Physics",
    icon: <Book className="size-4" />,
    units: ["Introduction to Quantum Mechanics", "Quantum Computing"],
  },
  {
    name: "History of Rome",
    icon: <Book className="size-4" />,
    units: ["The Roman Republic", "The Roman Empire"],
  },
  {
    name: "Organic Chemistry",
    icon: <Book className="size-4" />,
    units: ["Alkanes and Cycloalkanes", "Stereochemistry"],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
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
          {subjects.map((subject) => (
            <SidebarGroup key={subject.name}>
              <SidebarGroupLabel className="flex items-center gap-2">
                {subject.icon}
                <span>{subject.name}</span>
              </SidebarGroupLabel>
              {subject.units.map((unit, index) => (
                <SidebarMenuItem key={unit}>
                  <SidebarMenuButton
                    tooltip={unit}
                    isActive={index === 0}
                    className="justify-start"
                  >
                    <FileText />
                    <span>{unit}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroup>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Add Subject" className="justify-start text-muted-foreground">
              <PlusCircle />
              <span>Add Subject</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" className="justify-start">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
