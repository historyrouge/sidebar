"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuestionPaperPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const question_paper_content_1 = require("@/components/question-paper-content");
function QuestionPaperPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(question_paper_content_1.QuestionPaperContent, {}) }));
}
