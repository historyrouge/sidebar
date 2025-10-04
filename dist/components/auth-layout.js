"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthLayout = AuthLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const use_auth_1 = require("@/hooks/use-auth");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function AuthLayout({ children }) {
    const { user, loading } = (0, use_auth_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);
    if (loading || user) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex h-screen w-full items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex min-h-screen items-center justify-center bg-background p-4", children: children }));
}
