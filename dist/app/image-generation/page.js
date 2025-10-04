"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ImageGenerationPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const image_generation_content_1 = require("@/components/image-generation-content");
function ImageGenerationPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(image_generation_content_1.ImageGenerationContent, {}) }));
}
