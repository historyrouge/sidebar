"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthForm = AuthForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const use_auth_1 = require("@/hooks/use-auth");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const use_toast_1 = require("@/hooks/use-toast");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
function AuthForm({ type }) {
    const { user, loading: authLoading } = (0, use_auth_1.useAuth)();
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // This is a placeholder for actual auth logic.
        // Since accounts are disabled, we'll just simulate a login/signup
        // and redirect to the main page.
        setTimeout(() => {
            toast({
                title: type === 'login' ? 'Login Successful' : 'Signup Successful',
                description: "Welcome to SearnAI!",
            });
            router.push("/");
            setLoading(false);
        }, 1000);
    };
    const handleGoogleSignIn = () => {
        setLoading(true);
        // This is a placeholder for actual auth logic.
        setTimeout(() => {
            toast({
                title: "Sign-in Successful",
                description: "Welcome to SearnAI!",
            });
            router.push("/");
            setLoading(false);
        }, 1000);
    };
    const isLoading = loading || authLoading;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "grid gap-6", children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "grid gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid gap-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "email", children: "Email" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "email", type: "email", placeholder: "m@example.com", required: true, value: email, onChange: (e) => setEmail(e.target.value), disabled: isLoading })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid gap-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "password", children: "Password" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), disabled: isLoading })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", disabled: isLoading, className: "w-full", children: [isLoading && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), type === 'login' ? 'Login' : 'Create an account'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center", children: (0, jsx_runtime_1.jsx)("span", { className: "w-full border-t" }) }), (0, jsx_runtime_1.jsx)("div", { className: "relative flex justify-center text-xs uppercase", children: (0, jsx_runtime_1.jsx)("span", { className: "bg-background px-2 text-muted-foreground", children: "Or continue with" }) })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", type: "button", disabled: isLoading, onClick: handleGoogleSignIn, children: [isLoading ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : ((0, jsx_runtime_1.jsxs)("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 48 48", children: [(0, jsx_runtime_1.jsx)("path", { fill: "#FFC107", d: "M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#FF3D00", d: "M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#4CAF50", d: "M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#1976D2", d: "M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.801,44,24C44,22.659,43.862,21.35,43.611,20.083z" })] })), "Google"] }), type === 'login' ? ((0, jsx_runtime_1.jsxs)("p", { className: "px-8 text-center text-sm text-muted-foreground", children: ["By clicking continue, you agree to our", " ", (0, jsx_runtime_1.jsx)(link_1.default, { href: "/terms", className: "underline underline-offset-4 hover:text-primary", children: "Terms of Service" }), " ", "and", " ", (0, jsx_runtime_1.jsx)(link_1.default, { href: "/privacy", className: "underline underline-offset-4 hover:text-primary", children: "Privacy Policy" }), "."] })) : ((0, jsx_runtime_1.jsxs)("p", { className: "text-center text-sm text-muted-foreground", children: ["Already have an account?", ' ', (0, jsx_runtime_1.jsx)(link_1.default, { href: "/login", className: "underline hover:text-primary", children: "Log in" })] }))] }));
}
