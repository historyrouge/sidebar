"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StudyNowPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const study_now_content_1 = require("@/components/study-now-content");
function StudyNowPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(study_now_content_1.StudyNowContent, {}) }));
}
