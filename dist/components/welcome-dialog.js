"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeDialog = WelcomeDialog;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const dialog_1 = require("./ui/dialog");
const button_1 = require("./ui/button");
function WelcomeDialog() {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        try {
            const hasSeenPopup = localStorage.getItem("hasSeenWelcomePopup");
            if (!hasSeenPopup) {
                setIsOpen(true);
            }
        }
        catch (error) {
            console.error("Could not access localStorage", error);
        }
    }, []);
    const handleClose = () => {
        try {
            localStorage.setItem("hasSeenWelcomePopup", "true");
        }
        catch (error) {
            console.error("Could not write to localStorage", error);
        }
        setIsOpen(false);
    };
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: handleClose, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "max-w-lg", onEscapeKeyDown: handleClose, onPointerDownOutside: handleClose, children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { className: "text-2xl font-bold text-center", children: "Hello everyone! \uD83D\uDC4B" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "prose prose-sm dark:prose-invert max-w-none text-left py-4", children: [(0, jsx_runtime_1.jsxs)("p", { children: ["We warmly welcome you to ", (0, jsx_runtime_1.jsx)("strong", { children: "SearnAI" }), " \u2013 your smart study buddy! \uD83D\uDE80"] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Here, you can easily generate quizzes, create flashcards, and explore AI-powered study tools to make learning fun and stress-free. If you ever face any issues or have suggestions, feel free to reach out to us at ", (0, jsx_runtime_1.jsx)("a", { href: "mailto:harshrishabh@proton.me", children: "harshrishabh@proton.me" }), "."] }), (0, jsx_runtime_1.jsx)("p", { className: "!mb-0", children: "Thank you for being part of this journey!" }), (0, jsx_runtime_1.jsxs)("p", { className: "!mt-2 text-sm", children: ["Regards,", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("strong", { children: "Harsh & the Sri Chaitanya Team" }), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground", children: "Developers of SearnAI" })] })] }), (0, jsx_runtime_1.jsx)(dialog_1.DialogFooter, { children: (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleClose, children: "Close" }) })] }) }));
}
