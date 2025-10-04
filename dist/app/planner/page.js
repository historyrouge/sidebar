"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlannerPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const planner_content_1 = require("@/components/planner-content");
function PlannerPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(planner_content_1.PlannerContent, {}) }));
}
