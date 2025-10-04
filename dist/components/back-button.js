"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackButton = BackButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const navigation_1 = require("next/navigation");
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
function BackButton({ className }) {
    const router = (0, navigation_1.useRouter)();
    return ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "icon", onClick: () => router.back(), className: className, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Go back" })] }));
}
