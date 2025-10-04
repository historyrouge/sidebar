"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MindMapPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const mind_map_content_1 = require("@/components/mind-map-content");
function MindMapPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(mind_map_content_1.MindMapContent, {}) }));
}
