"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const main_dashboard_1 = require("@/components/main-dashboard");
function Home() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(main_dashboard_1.MainDashboard, {}) }));
}
