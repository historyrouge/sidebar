"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SignupPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const auth_layout_1 = require("@/components/auth-layout");
const auth_form_1 = require("@/components/auth-form");
const card_1 = require("@/components/ui/card");
function SignupPage() {
    return ((0, jsx_runtime_1.jsx)(auth_layout_1.AuthLayout, { children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "w-full max-w-sm", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-2xl", children: "Sign Up" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Create an account to get started." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(auth_form_1.AuthForm, { type: "signup" }) })] }) }));
}
