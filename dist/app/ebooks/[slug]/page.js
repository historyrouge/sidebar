"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EbookPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const ebook_reader_1 = require("@/components/ebook-reader");
function EbookPage({ params }) {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(ebook_reader_1.EbookReader, { slug: params.slug }) }));
}
