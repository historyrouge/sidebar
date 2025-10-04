"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainDashboard = MainDashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const next_themes_1 = require("next-themes");
const react_1 = __importDefault(require("react"));
const chat_content_1 = require("./chat-content");
const sidebar_1 = require("./ui/sidebar");
const dropdown_menu_1 = require("./ui/dropdown-menu");
const use_toast_1 = require("@/hooks/use-toast");
function MainDashboard() {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    const { toast } = (0, use_toast_1.useToast)();
    const { activeVideoId, activeVideoTitle, setActiveVideoId } = (0, chat_content_1.useChatStore)();
    const handleNewChat = () => {
        try {
            localStorage.removeItem('chatHistory');
            sessionStorage.removeItem('chatScrollPosition');
            window.location.reload();
        }
        catch (e) {
            console.error("Could not clear storage", e);
        }
    };
    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };
    const handleCopyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast({ title: "Copied!", description: "Video URL copied to clipboard." });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Chat" })] }), activeVideoId && ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 mx-4 max-w-md", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg bg-card border", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold truncate text-foreground", children: activeVideoTitle || 'Now Playing' }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "YouTube" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center flex-shrink-0", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "h-5 w-5" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: () => handleCopyToClipboard(`https://www.youtube.com/watch?v=${activeVideoId}`), children: "Copy video URL" }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { asChild: true, children: (0, jsx_runtime_1.jsx)("a", { href: `https://www.youtube.com/watch?v=${activeVideoId}`, target: "_blank", rel: "noopener noreferrer", children: "Watch on YouTube" }) })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: () => setActiveVideoId(null, null), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-5 w-5" }) })] })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "icon", onClick: handleNewChat, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileEdit, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "New Chat" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleTheme, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Toggle theme" })] })] })] }), (0, jsx_runtime_1.jsxs)("main", { className: "flex-1 overflow-hidden relative", children: [(0, jsx_runtime_1.jsx)(chat_content_1.ChatContent, {}), activeVideoId && ((0, jsx_runtime_1.jsx)("iframe", { className: "hidden", src: `https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1`, allow: "autoplay; encrypted-media", allowFullScreen: true, title: "YouTube music player" }))] })] }));
}
