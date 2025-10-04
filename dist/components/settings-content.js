"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsContent = SettingsContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const next_themes_1 = require("next-themes");
const button_1 = require("./ui/button");
const card_1 = require("./ui/card");
const lucide_react_1 = require("lucide-react");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
const avatar_1 = require("./ui/avatar");
const link_1 = __importDefault(require("next/link"));
const separator_1 = require("./ui/separator");
const react_1 = require("react");
const SettingsItem = ({ icon, label, href, value }) => ((0, jsx_runtime_1.jsxs)(link_1.default, { href: href, className: "flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [icon, (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: label })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-muted-foreground", children: [value && (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: value }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: "h-5 w-5" })] })] }));
function SettingsContent() {
    const { theme } = (0, next_themes_1.useTheme)();
    const [userName, setUserName] = (0, react_1.useState)("Guest");
    const [userStatus, setUserStatus] = (0, react_1.useState)("Using SearnAI");
    (0, react_1.useEffect)(() => {
        try {
            const storedName = localStorage.getItem("userName");
            const storedStatus = localStorage.getItem("userStatus");
            if (storedName)
                setUserName(storedName);
            if (storedStatus)
                setUserStatus(storedStatus);
        }
        catch (e) {
            console.warn("Could not access localStorage for user settings.");
        }
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-muted/40", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Settings" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-2xl space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center text-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative mb-4", children: [(0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-24 w-24 border-4 border-background shadow-md", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { className: "bg-avatar-accent text-3xl font-bold text-white/90", children: userName.charAt(0).toUpperCase() }) }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/settings/personalize", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "icon", className: "absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 bg-background", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4" }) }) })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold", children: userName }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: userStatus })] }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-2", children: [(0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.SlidersHorizontal, { className: "h-5 w-5 text-muted-foreground" }), label: "Personalize", href: "/settings/personalize" }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Paintbrush, { className: "h-5 w-5 text-muted-foreground" }), label: "Appearance", href: "/settings/appearance" }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Database, { className: "h-5 w-5 text-muted-foreground" }), label: "Data & Storage", href: "/settings/data" })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-2", children: [(0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-5 w-5 text-muted-foreground" }), label: "Notifications", href: "/settings/notifications" }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "h-5 w-5 text-muted-foreground" }), label: "Security & Privacy", href: "/settings/security" }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-5 w-5 text-muted-foreground" }), label: "Accounts", href: "/settings/accounts" })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-2", children: [(0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "h-5 w-5 text-muted-foreground" }), label: "Language", value: "English", href: "/settings/language" }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.ThumbsUp, { className: "h-5 w-5 text-muted-foreground" }), label: "Feedback", href: "/settings/feedback" }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsx)(SettingsItem, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "h-5 w-5 text-muted-foreground" }), label: "About Us", href: "/about" })] }) })] }) })] }));
}
