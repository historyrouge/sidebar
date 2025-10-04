"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreateFlashcardsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const create_flashcards_content_1 = require("@/components/create-flashcards-content");
function CreateFlashcardsPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(create_flashcards_content_1.CreateFlashcardsContent, {}) }));
}
