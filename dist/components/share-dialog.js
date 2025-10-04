"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareDialog = ShareDialog;
const jsx_runtime_1 = require("react/jsx-runtime");
const dialog_1 = require("./ui/dialog");
const button_1 = require("./ui/button");
const input_1 = require("./ui/input");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
const react_1 = require("react");
const XIcon = (props) => ((0, jsx_runtime_1.jsxs)("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0, jsx_runtime_1.jsx)("path", { d: "M18 6 6 18" }), (0, jsx_runtime_1.jsx)("path", { d: "m6 6 12 12" })] }));
const FacebookIcon = (props) => ((0, jsx_runtime_1.jsx)("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: (0, jsx_runtime_1.jsx)("path", { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" }) }));
const LinkedinIcon = (props) => ((0, jsx_runtime_1.jsxs)("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0, jsx_runtime_1.jsx)("path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }), (0, jsx_runtime_1.jsx)("rect", { width: "4", height: "12", x: "2", y: "9" }), (0, jsx_runtime_1.jsx)("circle", { cx: "4", cy: "4", r: "2" })] }));
function ShareDialog({ isOpen, onOpenChange, content }) {
    const { toast } = (0, use_toast_1.useToast)();
    const [shareUrl, setShareUrl] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        // In a real app, you might generate a unique URL for the content.
        // For this demo, we'll just use the current window location.
        setShareUrl(window.location.href);
    }, [isOpen]);
    const handleCopyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast({ title: `Copied to clipboard!`, description: `The ${type} has been copied.` });
    };
    const createShareLink = (platform) => {
        const text = `Check out this response from SearnAI: "${content.substring(0, 100)}..."`;
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(shareUrl);
        switch (platform) {
            case 'twitter':
                return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
            case 'linkedin':
                return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=Response%20from%20SearnAI&summary=${encodedText}`;
        }
    };
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogHeader, { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Share this response" }), (0, jsx_runtime_1.jsx)(dialog_1.DialogDescription, { children: "Anyone with the link will be able to view this conversation." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: shareUrl, readOnly: true }), (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "icon", onClick: () => handleCopyToClipboard(shareUrl, 'link'), disabled: true, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Copy Link" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "icon", onClick: () => handleCopyToClipboard(content, 'text'), children: [(0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "lucide lucide-clipboard-type h-4 w-4", children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 5H9.5a2.5 2.5 0 0 0 0 5h7a2.5 2.5 0 0 1 0 5h-7a2.5 2.5 0 0 0 0 5H12" }), (0, jsx_runtime_1.jsx)("rect", { width: "10", height: "14", x: "8", y: "3", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3.5" })] }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Copy Text" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center space-x-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", size: "icon", children: (0, jsx_runtime_1.jsx)("a", { href: createShareLink('twitter'), target: "_blank", rel: "noopener noreferrer", children: (0, jsx_runtime_1.jsx)(XIcon, { className: "h-5 w-5" }) }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", size: "icon", children: (0, jsx_runtime_1.jsx)("a", { href: createShareLink('facebook'), target: "_blank", rel: "noopener noreferrer", children: (0, jsx_runtime_1.jsx)(FacebookIcon, { className: "h-5 w-5" }) }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", size: "icon", children: (0, jsx_runtime_1.jsx)("a", { href: createShareLink('linkedin'), target: "_blank", rel: "noopener noreferrer", children: (0, jsx_runtime_1.jsx)(LinkedinIcon, { className: "h-5 w-5" }) }) })] })] })] }) }));
}
