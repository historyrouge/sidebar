"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfHubContent = PdfHubContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
function PdfHubContent() {
    const [file, setFile] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        }
        else {
            toast({ title: 'Invalid File', description: 'Please select a PDF file.', variant: 'destructive' });
        }
    };
    const handleUpload = () => {
        if (!file) {
            toast({ title: 'No file selected', description: 'Please choose a PDF file to upload.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        toast({ title: 'Coming Soon!', description: 'PDF processing and study features will be implemented in a future step.' });
        // Simulate a network request
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "PDF Study Hub" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-2xl space-y-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Upload Your PDF" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Upload a PDF document to extract its text and create a study session." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/30 text-center cursor-pointer hover:bg-muted/50 transition-colors", onClick: () => document.getElementById('pdf-upload')?.click(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileUp, { className: "w-12 h-12 text-muted-foreground" }), file ? ((0, jsx_runtime_1.jsx)("p", { className: "mt-4 font-semibold text-foreground", children: file.name })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "mt-4 font-semibold", children: "Click to upload or drag and drop" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "PDF (max 5MB)" })] })), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "pdf-upload", type: "file", className: "hidden", accept: "application/pdf", onChange: handleFileChange })] }) })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { className: "w-full", size: "lg", disabled: !file || isLoading, onClick: handleUpload, children: [isLoading && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Create Study Session"] })] }) })] }));
}
