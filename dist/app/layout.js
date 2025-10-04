"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./globals.css");
const toaster_1 = require("@/components/ui/toaster");
const utils_1 = require("@/lib/utils");
const theme_provider_1 = require("@/components/theme-provider");
const page_loader_1 = require("@/components/page-loader");
const use_auth_1 = require("@/hooks/use-auth");
exports.metadata = {
    title: 'SearnAI',
    description: 'AI-powered study tool to help you learn smarter.',
};
function RootLayout({ children, }) {
    return ((0, jsx_runtime_1.jsxs)("html", { lang: "en", suppressHydrationWarning: true, children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }), (0, jsx_runtime_1.jsx)("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }), (0, jsx_runtime_1.jsx)("link", { href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap", rel: "stylesheet" })] }), (0, jsx_runtime_1.jsx)("body", { className: (0, utils_1.cn)("min-h-screen bg-background font-body antialiased"), suppressHydrationWarning: true, children: (0, jsx_runtime_1.jsx)(theme_provider_1.ThemeProvider, { attribute: "class", defaultTheme: "system", enableSystem: true, disableTransitionOnChange: true, children: (0, jsx_runtime_1.jsxs)(use_auth_1.AuthProvider, { children: [(0, jsx_runtime_1.jsx)(page_loader_1.PageLoader, { children: children }), (0, jsx_runtime_1.jsx)(toaster_1.Toaster, {})] }) }) })] }));
}
