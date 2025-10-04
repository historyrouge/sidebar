"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeChatCard = YoutubeChatCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const image_1 = __importDefault(require("next/image"));
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
function YoutubeChatCard({ videoData, onPin }) {
    const { toast } = (0, use_toast_1.useToast)();
    const [isPlayerActive, setIsPlayerActive] = (0, react_1.useState)(false);
    const handleShare = () => {
        const url = `https://www.youtube.com/watch?v=${videoData.videoId}`;
        navigator.clipboard.writeText(url);
        toast({ title: "Copied!", description: "YouTube video link copied to clipboard." });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-sm rounded-xl border bg-card/50 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative aspect-video group", children: isPlayerActive ? ((0, jsx_runtime_1.jsx)("iframe", { className: "w-full h-full", src: `https://www.youtube.com/embed/${videoData.videoId}?autoplay=1`, title: videoData.title || "YouTube video player", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: videoData.thumbnail || `https://i.ytimg.com/vi/${videoData.videoId}/hqdefault.jpg`, alt: videoData.title || "YouTube video", fill: true, className: "object-cover" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer", onClick: () => setIsPlayerActive(true), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Play, { className: "h-12 w-12 text-white fill-white" }) })] })) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-semibold text-sm line-clamp-1", children: videoData.title || "YouTube Video" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "YouTube" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", className: "w-full", onClick: onPin, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pin, { className: "mr-2 h-4 w-4" }), "Pin to header"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: handleShare, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { className: "h-4 w-4" }) })] })] })] }));
}
