"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EbooksPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const ebooks_content_1 = require("@/components/ebooks-content");
function EbooksPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(ebooks_content_1.EbooksContent, {}) }));
}
