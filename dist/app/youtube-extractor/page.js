"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = YouTubeExtractorPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const youtube_extractor_content_1 = require("@/components/youtube-extractor-content");
function YouTubeExtractorPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(youtube_extractor_content_1.YouTubeExtractorContent, {}) }));
}
