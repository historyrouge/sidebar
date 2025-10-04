"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainLayout = MainLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const app_sidebar_1 = require("./app-sidebar");
const sidebar_1 = require("./ui/sidebar");
function MainLayout({ children }) {
    // No-auth experience: The app is now public, so we don't need to check for a user.
    return ((0, jsx_runtime_1.jsxs)(sidebar_1.SidebarProvider, { children: [(0, jsx_runtime_1.jsx)(app_sidebar_1.AppSidebar, {}), (0, jsx_runtime_1.jsx)(sidebar_1.SidebarInset, { children: children })] }));
}
