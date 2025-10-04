"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PresentationMakerPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const presentation_maker_content_1 = require("@/components/presentation-maker-content");
function PresentationMakerPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(presentation_maker_content_1.PresentationMakerContent, {}) }));
}
