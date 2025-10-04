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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSidebar = AppSidebar;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const sidebar_1 = require("@/components/ui/sidebar");
const sidebar_2 = require("./ui/sidebar");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_1 = __importStar(require("react"));
const navigation_2 = require("next/navigation");
const studyTools = [
    { name: "Study Session", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.GraduationCap, {}), href: "/study-now" },
    { name: "AI Editor", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Brush, {}), href: "/ai-editor" },
    { name: "Code Analyzer", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Code, {}), href: "/code-analyzer" },
    { name: "Flashcards", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, {}), href: "/create-flashcards" },
    { name: "Quiz", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.FileQuestion, {}), href: "/quiz" },
    { name: "Mind Map", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.BrainCircuit, {}), href: "/mind-map" },
    { name: "Question Paper", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, {}), href: "/question-paper" },
    { name: "Presentation Maker", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Presentation, {}), href: "/presentation-maker" },
    { name: "Image Generation", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Image, {}), href: "/image-generation" },
];
const resources = [
    { name: "Web Browser", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Globe, {}), href: "/web-browser" },
    { name: "YouTube Tools", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Youtube, {}), href: "/youtube-extractor" },
    { name: "News", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Rss, {}), href: "/news" },
    { name: "eBooks", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.BookOpen, {}), href: "/ebooks" },
    { name: "Text-to-Speech", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Volume2, {}), href: "/text-to-speech" },
    { name: "AI Training", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Cpu, {}), href: "/ai-training" },
];
const mainNav = [
    { name: "Home", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Home, {}), href: "/" },
    { name: "Planner", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, {}), href: "/planner" },
];
const AppLogo = () => ((0, jsx_runtime_1.jsxs)("svg", { className: "size-5", viewBox: "0 0 100 100", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0, jsx_runtime_1.jsx)("path", { d: "M50 2.88675L93.3013 26.4434V73.5566L50 97.1132L6.69873 73.5566V26.4434L50 2.88675Z", fill: "currentColor", className: "text-primary-foreground" }), (0, jsx_runtime_1.jsx)("path", { d: "M63 40.5C63 36.3579 59.6421 33 55.5 33H44.5C40.3579 33 37 36.3579 37 40.5V43.5C37 47.6421 40.3579 51 44.5 51H55.5C59.6421 51 63 54.3579 63 58.5V61.5C63 65.6421 59.6421 69 55.5 69H44.5C40.3579 69 37 65.6421 37 61.5", stroke: "hsl(var(--primary))", strokeWidth: "8", strokeLinecap: "round", strokeLinejoin: "round" })] }));
function AppSidebar() {
    const { setOpenMobile } = (0, sidebar_2.useSidebar)();
    const router = (0, navigation_2.useRouter)();
    const currentPathname = (0, navigation_1.usePathname)();
    const [pathname, setPathname] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        setPathname(currentPathname);
    }, [currentPathname]);
    const handleLinkClick = () => {
        setOpenMobile(false);
    };
    const handleNewChat = () => {
        handleLinkClick();
        try {
            if (pathname === '/') {
                localStorage.removeItem('chatHistory');
                sessionStorage.removeItem('chatScrollPosition');
                window.location.reload();
            }
            else {
                router.push('/');
            }
        }
        catch (e) {
            console.error("Could not clear storage", e);
        }
    };
    const renderMenuItems = (items) => {
        return items.map((item) => ((0, jsx_runtime_1.jsx)(sidebar_1.SidebarMenuItem, { children: (0, jsx_runtime_1.jsx)(link_1.default, { href: item.href, passHref: true, children: (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenuButton, { tooltip: item.name, isActive: pathname === item.href, className: "justify-start w-full gap-2.5 px-3", onClick: handleLinkClick, children: [(0, jsx_runtime_1.jsx)("div", { className: "transition-transform duration-200 group-hover/menu-button:scale-110", children: item.icon }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: item.name })] }) }) }, item.name)));
    };
    return ((0, jsx_runtime_1.jsxs)(sidebar_1.Sidebar, { className: "bg-card/5 border-r border-border/10 text-sidebar-foreground backdrop-blur-lg", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarHeader, { className: "p-4", children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/", className: "flex items-center gap-2.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground", children: (0, jsx_runtime_1.jsx)(AppLogo, {}) }), (0, jsx_runtime_1.jsx)("h1", { className: "text-lg font-semibold", children: "SearnAI" })] }) }), (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarContent, { className: "p-2 flex-grow flex flex-col", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-grow", children: [(0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenu, { children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarMenuItem, { children: (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenuButton, { onClick: handleNewChat, className: "justify-start w-full gap-2.5 px-3 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileEdit, {}), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: "New Chat" })] }) }), renderMenuItems(mainNav)] }), (0, jsx_runtime_1.jsx)(sidebar_1.SidebarSeparator, { className: "my-4" }), (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenu, { children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarGroupLabel, { className: "uppercase text-xs font-semibold tracking-wider px-3 my-2 text-sidebar-group-foreground", children: "Study Tools" }), renderMenuItems(studyTools)] }), (0, jsx_runtime_1.jsx)(sidebar_1.SidebarSeparator, { className: "my-4" }), (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenu, { children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarGroupLabel, { className: "uppercase text-xs font-semibold tracking-wider px-3 my-2 text-sidebar-group-foreground", children: "Resources" }), renderMenuItems(resources)] })] }), (0, jsx_runtime_1.jsx)(sidebar_1.SidebarFooter, { className: "p-2 border-t border-sidebar-border", children: (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenu, { children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarMenuItem, { children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/settings", children: (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenuButton, { className: "w-full justify-start gap-2.5 px-3", isActive: pathname.startsWith('/settings'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, {}), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: "Settings" })] }) }) }), (0, jsx_runtime_1.jsx)(sidebar_1.SidebarMenuItem, { children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/about", children: (0, jsx_runtime_1.jsxs)(sidebar_1.SidebarMenuButton, { className: "w-full justify-start gap-2.5 px-3", isActive: pathname === '/about', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Info, {}), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: "About Us" })] }) }) })] }) })] })] }));
}
