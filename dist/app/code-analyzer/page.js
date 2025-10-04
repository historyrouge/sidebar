"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CodeAnalyzerPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const code_analyzer_content_1 = require("@/components/code-analyzer-content");
function CodeAnalyzerPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(code_analyzer_content_1.CodeAnalyzerContent, {}) }));
}
