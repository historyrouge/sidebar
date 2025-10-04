"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSecurityContent = SettingsSecurityContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const card_1 = require("./ui/card");
const lucide_react_1 = require("lucide-react");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
function SettingsSecurityContent() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-muted/40", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Security & Privacy" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)("div", { className: "mx-auto max-w-2xl space-y-8", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "w-5 h-5" }), " Security & Privacy"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Manage your account security and data privacy." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Construction, { className: "w-12 h-12 mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-foreground", children: "Feature Coming Soon" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "Security and privacy settings are currently under development." })] }) })] }) }) })] }));
}
