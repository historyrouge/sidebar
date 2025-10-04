"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebBrowserPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const web_browser_content_1 = require("@/components/web-browser-content");
function WebBrowserPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(web_browser_content_1.WebBrowserContent, {}) }));
}
