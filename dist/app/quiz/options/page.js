"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuizOptionsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const quiz_options_form_1 = require("@/components/quiz-options-form");
function QuizOptionsPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(quiz_options_form_1.QuizOptionsForm, {}) }));
}
