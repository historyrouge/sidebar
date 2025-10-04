"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainDashboard = MainDashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const next_themes_1 = require("next-themes");
const react_1 = __importStar(require("react"));
const chat_content_1 = require("./chat-content");
const sidebar_1 = require("./ui/sidebar");
const dropdown_menu_1 = require("./ui/dropdown-menu");
const use_toast_1 = require("@/hooks/use-toast");
const utils_1 = require("@/lib/utils");
const news_content_1 = require("./news-content");
function MainDashboard() {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    const { toast } = (0, use_toast_1.useToast)();
    const { activeVideoId, activeVideoTitle, setActiveVideoId, isPlaying, togglePlay, showPlayer, setShowPlayer } = (0, chat_content_1.useChatStore)();
    const iframeRef = (0, react_1.useRef)(null);
    const [activeView, setActiveView] = (0, react_1.useState)('searnai');
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
    const postPlayerMessage = (command) => {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: command, args: '' }), 'https://www.youtube.com');
    };
    const handlePlayPause = () => {
        togglePlay();
    };
    (0, react_1.useEffect)(() => {
        if (activeVideoId) {
            if (isPlaying) {
                postPlayerMessage('playVideo');
            }
            else {
                postPlayerMessage('pauseVideo');
            }
        }
    }, [isPlaying, activeVideoId]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Chat" })] }), activeVideoId && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 p-1.5 rounded-lg bg-card border w-full max-w-md", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold truncate text-foreground", children: activeVideoTitle || 'Now Playing' }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center text-muted-foreground -ml-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Rewind, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: handlePlayPause, children: isPlaying ? (0, jsx_runtime_1.jsx)(lucide_react_1.Pause, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Play, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FastForward, { className: "h-4 w-4" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center flex-shrink-0", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setShowPlayer(!showPlayer), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Video, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "h-4 w-4" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: () => handleCopyToClipboard(`https://www.youtube.com/watch?v=${activeVideoId}`), children: "Copy video URL" }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { asChild: true, children: (0, jsx_runtime_1.jsx)("a", { href: `https://www.youtube.com/watch?v=${activeVideoId}`, target: "_blank", rel: "noopener noreferrer", children: "Watch on YouTube" }) })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setActiveVideoId(null, null), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "icon", onClick: handleNewChat, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileEdit, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "New Chat" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleTheme, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Toggle theme" })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center p-2 border-b", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-muted p-1 rounded-lg flex gap-1 w-full", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: activeView === 'stories' ? 'outline' : 'ghost', className: (0, utils_1.cn)("gap-2 flex-1", activeView === 'stories' && 'bg-background'), onClick: () => setActiveView('stories'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Newspaper, { className: "h-4 w-4" }), "Stories"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: activeView === 'searnai' ? 'outline' : 'ghost', className: (0, utils_1.cn)("gap-2 flex-1", activeView === 'searnai' && 'bg-background'), onClick: () => setActiveView('searnai'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MessageSquare, { className: "h-4 w-4" }), "Searn AI"] })] }) }), (0, jsx_runtime_1.jsxs)("main", { className: "flex-1 overflow-hidden relative", children: [activeView === 'searnai' ? ((0, jsx_runtime_1.jsx)(chat_content_1.ChatContent, {})) : ((0, jsx_runtime_1.jsx)(news_content_1.NewsContent, {})), activeVideoId && showPlayer && ((0, jsx_runtime_1.jsxs)("div", { className: "fixed bottom-4 right-4 z-50 group", children: [(0, jsx_runtime_1.jsx)("iframe", { ref: iframeRef, className: "w-full max-w-sm aspect-video rounded-lg shadow-xl", src: `https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1`, allow: "autoplay; encrypted-media", allowFullScreen: true, title: "YouTube music player" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "secondary", size: "icon", className: "absolute -top-3 -right-3 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => setShowPlayer(false), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })), activeVideoId && !showPlayer && (
                    // Hidden iframe to control playback even when floating player is not visible
                    (0, jsx_runtime_1.jsx)("iframe", { ref: iframeRef, className: "hidden", src: `https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1`, allow: "autoplay; encrypted-media", title: "YouTube music player" }))] })] }));
}
