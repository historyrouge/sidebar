"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HelpPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const help_content_1 = require("@/components/help-content");
function HelpPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(help_content_1.HelpContent, {}) }));
}
