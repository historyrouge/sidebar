
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
    DropdownMenuSeparator as DropdownSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const menuItems = [
    { name: "Home", icon: <Home />, href: "/" },
    { name: "Code Analyzer", icon: <Code />, href: "/code-analyzer" },
    { name: "Create Flashcards", icon: <Plus />, href: "/create-flashcards" },
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
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.479l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );


export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const renderMenuItems = (items: typeof menuItems | typeof bottomMenuItems) => {
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Logo className="size-5" />
            </div>
            <h1 className="text-lg font-semibold">Easy Learn AI</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow flex flex-col">
        <SidebarMenu className="flex-grow">
            {renderMenuItems(menuItems)}
            <SidebarSeparator className="my-2" />
            {renderMenuItems(bottomMenuItems)}
        </SidebarMenu>
        <SidebarMenu>
            <SidebarMenuItem>
                <Button className="w-full h-12 rounded-full text-lg">Post</Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 overflow-hidden rounded-full p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50">
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
                <DropdownSeparator />
                <DropdownMenuItem disabled>
                    <User className="mr-2" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <Settings className="mr-2" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownSeparator />
                <DropdownMenuItem disabled>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
