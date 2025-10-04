"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsContent = FriendsContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
function FriendsContent() {
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-1 items-center justify-center bg-muted/40 p-4 md:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "mx-auto h-12 w-12 text-muted-foreground" }), (0, jsx_runtime_1.jsx)("h2", { className: "mt-4 text-2xl font-semibold", children: "Friends Feature Disabled" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-muted-foreground", children: "User accounts are no longer required to use this application." })] }) }));
}
