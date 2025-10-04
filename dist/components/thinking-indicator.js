"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThinkingIndicator = ThinkingIndicator;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const typewriter_text_1 = require("./typewriter-text");
const collapsible_1 = require("./ui/collapsible");
const button_1 = require("./ui/button");
const utils_1 = require("@/lib/utils");
function ThinkingIndicator({ text }) {
    const [isAnimating, setIsAnimating] = (0, react_1.useState)(true);
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    const handleAnimationComplete = () => {
        setIsAnimating(false);
    };
    const previewLines = text.split('\n').slice(0, 3).join('\n');
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-3 rounded-lg bg-muted/50 mb-4", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bot, { className: "h-3 w-3" }), " DeepThink"] }), isAnimating ? ((0, jsx_runtime_1.jsx)(typewriter_text_1.TypewriterText, { text: text, onComplete: handleAnimationComplete })) : ((0, jsx_runtime_1.jsxs)(collapsible_1.Collapsible, { open: isExpanded, onOpenChange: setIsExpanded, children: [(0, jsx_runtime_1.jsx)("div", { className: "font-mono text-xs whitespace-pre-wrap", children: isExpanded ? text : previewLines }), (0, jsx_runtime_1.jsx)(collapsible_1.CollapsibleTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "link", className: "p-0 h-auto text-xs mt-2", children: [isExpanded ? 'Show less' : 'Show more', (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: (0, utils_1.cn)("h-3 w-3 ml-1 transition-transform", isExpanded && "rotate-180") })] }) })] }))] }));
}
