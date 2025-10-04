"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsContent = MaterialsContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
function MaterialsContent() {
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)("div", { className: "flex flex-1 items-center justify-center bg-muted/40 p-4 md:p-8 h-full rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Library, { className: "mx-auto h-12 w-12 text-muted-foreground" }), (0, jsx_runtime_1.jsx)("h2", { className: "mt-4 text-2xl font-semibold", children: "Saved Materials Disabled" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-muted-foreground", children: "User accounts are no longer required, so saving materials is disabled." })] }) }) }));
}
