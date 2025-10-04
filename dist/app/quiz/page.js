"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuizPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const quiz_content_1 = require("@/components/quiz-content");
function QuizPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(quiz_content_1.QuizContent, {}) }));
}
