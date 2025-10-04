"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuizResultsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const quiz_results_content_1 = require("@/components/quiz-results-content");
function QuizResultsPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(quiz_results_content_1.QuizResultsContent, {}) }));
}
