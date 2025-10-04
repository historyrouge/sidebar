"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsNotificationsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const settings_notifications_1 = require("@/components/settings-notifications");
function SettingsNotificationsPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(settings_notifications_1.SettingsNotificationsContent, {}) }));
}
