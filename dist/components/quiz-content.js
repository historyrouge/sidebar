"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizContent = QuizContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const sidebar_1 = require("./ui/sidebar");
const quiz_generator_1 = require("./quiz-generator");
const back_button_1 = require("./back-button");
function QuizContent() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Quiz" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)(quiz_generator_1.QuizGenerator, {}) })] }));
}
