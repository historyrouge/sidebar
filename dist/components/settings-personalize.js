"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPersonalizeContent = SettingsPersonalizeContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("./ui/button");
const card_1 = require("./ui/card");
const input_1 = require("./ui/input");
const label_1 = require("./ui/label");
const lucide_react_1 = require("lucide-react");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
const use_toast_1 = require("@/hooks/use-toast");
function SettingsPersonalizeContent() {
    const [name, setName] = (0, react_1.useState)('');
    const [status, setStatus] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        try {
            const storedName = localStorage.getItem("userName");
            const storedStatus = localStorage.getItem("userStatus");
            if (storedName)
                setName(storedName);
            if (storedStatus)
                setStatus(storedStatus);
        }
        catch (e) {
            console.warn("Could not access localStorage.");
        }
    }, []);
    const handleSave = () => {
        setIsLoading(true);
        try {
            localStorage.setItem("userName", name || "Guest");
            localStorage.setItem("userStatus", status || "Using SearnAI");
            toast({
                title: "Profile Saved!",
                description: "Your personalization settings have been updated.",
            });
        }
        catch (e) {
            toast({
                title: "Error Saving",
                description: "Could not save settings to local storage.",
                variant: "destructive",
            });
        }
        setTimeout(() => setIsLoading(false), 500); // Simulate save
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-muted/40", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Personalize" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)("div", { className: "mx-auto max-w-2xl space-y-8", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "w-5 h-5" }), " Profile"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "This information is stored only in your browser." })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "name", children: "Display Name" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "name", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g., Alex Doe" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "status", children: "Status" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "status", value: status, onChange: (e) => setStatus(e.target.value), placeholder: "What are you working on?" })] })] }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleSave, disabled: isLoading, children: [isLoading ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }), "Save Changes"] }) })] }) }) })] }));
}
