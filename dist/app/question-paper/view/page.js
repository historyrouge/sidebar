"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuestionPaperViewPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const question_paper_viewer_1 = require("@/components/question-paper-viewer");
function QuestionPaperViewPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(question_paper_viewer_1.QuestionPaperViewer, {}) }));
}
