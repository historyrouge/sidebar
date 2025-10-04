"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitExhaustedDialog = LimitExhaustedDialog;
const jsx_runtime_1 = require("react/jsx-runtime");
const dialog_1 = require("./ui/dialog");
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
function LimitExhaustedDialog({ isOpen, onOpenChange }) {
    const handleReload = () => {
        window.location.reload();
    };
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogHeader, { children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "text-destructive" }), "Message Limit Reached"] }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogDescription, { className: "pt-2", children: ["You have exhausted your message limits for all available AI models. To continue using the app, you can upgrade, try again after a minute, or come back tomorrow.", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("br", {}), "Sorry for the inconvenience.", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("br", {}), "Regards,", (0, jsx_runtime_1.jsx)("br", {}), "Harsh"] })] }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogFooter, { children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Close" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleReload, children: "Try Again" })] })] }) }));
}
