"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewsReaderPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const news_reader_content_1 = require("@/components/news-reader-content");
function NewsReaderPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(news_reader_content_1.NewsReaderContent, {}) }));
}
