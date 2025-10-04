"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsSecurityPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const settings_security_1 = require("@/components/settings-security");
function SettingsSecurityPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(settings_security_1.SettingsSecurityContent, {}) }));
}
