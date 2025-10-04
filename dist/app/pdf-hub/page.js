"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PdfHubPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const pdf_hub_content_1 = require("@/components/pdf-hub-content");
function PdfHubPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(pdf_hub_content_1.PdfHubContent, {}) }));
}
