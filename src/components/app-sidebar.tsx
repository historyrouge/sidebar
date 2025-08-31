
"use client";

import {
  BookOpen,
  HelpCircle,
  Info,
  MessageSquare,
  PlusSquare,
  Settings,
  Sparkles,
  Youtube,
  FileQuestion,
  Rss,
  Code,
  User,
  MoreHorizontal,
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
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const menuItems = [
    { name: "Chat", icon: <MessageSquare />, href: "/" },
    { name: "Study Session", icon: <Sparkles />, href: "/study-now" },
    { name: "Code Analyzer", icon: <Code />, href: "/code-analyzer" },
    { name: "Create Flashcards", icon: <PlusSquare />, href: "/create-flashcards" },
    { name: "Quiz", icon: <FileQuestion />, href: "/quiz" },
    { name: "YouTube Tools", icon: <Youtube />, href: "/youtube-extractor" },
    { name: "News", icon: <Rss />, href: "/news" },
    { name: "eBooks", icon: <BookOpen />, href: "/ebooks" },
];

const bottomMenuItems = [
    { name: "Settings", icon: <Settings />, href: "/settings" },
    { name: "Help", icon: <HelpCircle />, href: "/help" },
    { name: "About Us", icon: <Info />, href: "/about" },
]

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <title>Easy Learn AI Logo</title>
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z"/>
        <path d="M4.2 11.27L12 8.5l7.8 2.77"/>
        <path d="M12 20v-7.5"/>
        <path d="M11.5 6.5L6.25 8.25l5.5 2.25 5.5-2.25L12.5 6.5c-.25-.1-.75-.1-1 0z"/>
    </svg>
);


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
        <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo className="size-5" />
            </div>
            <h1 className="text-lg font-semibold">Easy Learn AI</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow">
        <SidebarMenu>
            {renderMenuItems(menuItems)}
            {renderMenuItems(bottomMenuItems)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50">
                    <Avatar className="size-8">
                        <AvatarFallback>N</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                        <p className="truncate font-semibold text-sidebar-foreground">Guest User</p>
                    </div>
                    <MoreHorizontal className="size-4 shrink-0 text-sidebar-foreground/50" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <User className="mr-2" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <Settings className="mr-2" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
