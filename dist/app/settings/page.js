"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const settings_content_1 = require("@/components/settings-content");
function SettingsPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(settings_content_1.SettingsContent, {}) }));
}
