"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteChatCard = WebsiteChatCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
function WebsiteChatCard({ websiteData }) {
    const { url, title, snippet } = websiteData;
    const displayUrl = new URL(url).hostname;
    return ((0, jsx_runtime_1.jsx)("div", { className: "w-full max-w-sm rounded-xl border bg-card/50 overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 mt-1", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "h-5 w-5 text-muted-foreground" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-semibold text-sm line-clamp-2", children: title || "Web Search Result" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-green-500 dark:text-green-400", children: displayUrl })] })] }), snippet && ((0, jsx_runtime_1.jsx)("p", { className: "mt-3 text-xs text-muted-foreground line-clamp-3", children: snippet })), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 flex gap-2", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: url, target: "_blank", rel: "noopener noreferrer", className: "w-full", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "mr-2 h-4 w-4" }), "Visit Site"] }) }) })] }) }));
}
