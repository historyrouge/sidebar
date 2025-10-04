"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AboutPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const about_content_1 = require("@/components/about-content");
function AboutPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(about_content_1.AboutContent, {}) }));
}
