"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsAppearanceContent = SettingsAppearanceContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const theme_provider_1 = require("@/components/theme-provider");
const button_1 = require("./ui/button");
const card_1 = require("./ui/card");
const lucide_react_1 = require("lucide-react");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
const utils_1 = require("@/lib/utils");
const accentColors = [
    { name: 'orange', color: 'hsl(25 95% 53%)' },
    { name: 'rose', color: 'hsl(347 77% 50%)' },
    { name: 'green', color: 'hsl(142 71% 40%)' },
    { name: 'default', color: 'hsl(221 83% 53%)' }, // Blue
];
function SettingsAppearanceContent() {
    const { theme, setTheme, accentColor, setAccentColor } = (0, theme_provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-muted/40", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Appearance" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-2xl space-y-8", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Paintbrush, { className: "w-5 h-5" }), " Theme"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Select the theme for the application." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: theme === 'light' ? 'default' : 'outline', onClick: () => setTheme('light'), className: "h-24 flex flex-col gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "w-6 h-6" }), "Light Mode"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: theme === 'dark' ? 'default' : 'outline', onClick: () => setTheme('dark'), className: "h-24 flex flex-col gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "w-6 h-6" }), "Dark Mode"] })] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Palette, { className: "w-5 h-5" }), " Accent Color"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Choose an accent color for highlights and primary buttons." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-3", children: accentColors.map(color => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setAccentColor && setAccentColor(color.name), className: (0, utils_1.cn)("h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center", accentColor === color.name ? 'border-foreground scale-110' : 'border-transparent'), style: { backgroundColor: color.color }, "aria-label": `Set accent color to ${color.name}`, children: accentColor === color.name && (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "w-5 h-5 text-white" }) }, color.name))) }) })] })] }) })] }));
}
