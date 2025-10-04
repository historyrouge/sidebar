"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsDataContent = SettingsDataContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const button_1 = require("./ui/button");
const card_1 = require("./ui/card");
const lucide_react_1 = require("lucide-react");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
const use_toast_1 = require("@/hooks/use-toast");
const alert_dialog_1 = require("@/components/ui/alert-dialog");
function SettingsDataContent() {
    const { toast } = (0, use_toast_1.useToast)();
    const handleClearHistory = () => {
        try {
            localStorage.removeItem("chatHistory");
            toast({
                title: "Chat History Cleared",
                description: "Your conversation history has been deleted from this browser.",
            });
        }
        catch (e) {
            toast({
                title: "Error",
                description: "Could not clear chat history.",
                variant: "destructive",
            });
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-muted/40", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Data & Storage" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)("div", { className: "mx-auto max-w-2xl space-y-8", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Database, { className: "w-5 h-5" }), " Manage Data"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Control how your data is stored in this browser." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "Your chat history is saved in your browser's local storage. Clearing it will remove all your past conversations permanently from this device." }) }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialog, { children: [(0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialogTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "destructive", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }), "Clear Chat History"] }) }), (0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialogContent, { children: [(0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialogHeader, { children: [(0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialogTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, {}), "Are you absolutely sure?"] }), (0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialogDescription, { children: "This action cannot be undone. This will permanently delete your entire chat history from this device." })] }), (0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialogFooter, { children: [(0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialogCancel, { children: "Cancel" }), (0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialogAction, { onClick: handleClearHistory, children: "Yes, delete history" })] })] })] }) })] }) }) })] }));
}
