"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = ChatInput;
const jsx_runtime_1 = require("react/jsx-runtime");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const react_1 = __importStar(require("react"));
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const dropdown_menu_1 = require("./ui/dropdown-menu");
const image_1 = __importDefault(require("next/image"));
const progress_1 = require("./ui/progress");
function ChatInput({ input, setInput, isTyping, isRecording, isOcrProcessing, ocrProgress, handleSendMessage, handleToggleRecording, toggleEditor, imageDataUri, setImageDataUri, fileContent, setFileContent, fileName, setFileName, handleImageFileChange }) {
    const { toast } = (0, use_toast_1.useToast)();
    const fileInputRef = (0, react_1.useRef)(null);
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
    };
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === "text/plain") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFileContent(e.target?.result);
                    setFileName(file.name);
                    setImageDataUri(null);
                };
                reader.readAsText(file);
            }
            else {
                toast({ title: "Invalid file type", description: "Please upload a .txt file.", variant: "destructive" });
            }
        }
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const handleOpenFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = ".txt";
            fileInputRef.current.onchange = handleFileChange;
            fileInputRef.current.click();
        }
    };
    const handleOpenImageDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = "image/*";
            fileInputRef.current.onchange = handleImageFileChange;
            fileInputRef.current.click();
        }
    };
    const isInputDisabled = isTyping || isOcrProcessing;
    return ((0, jsx_runtime_1.jsx)("div", { className: "p-4 border-t bg-background", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-3xl", children: [isOcrProcessing && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-2", children: [(0, jsx_runtime_1.jsx)(progress_1.Progress, { value: ocrProgress, className: "w-full h-1" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground text-center mt-1", children: "Extracting text from image..." })] })), imageDataUri && !isOcrProcessing && ((0, jsx_runtime_1.jsxs)("div", { className: "relative mb-2 w-fit", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: imageDataUri, alt: "Image preview", width: 80, height: 80, className: "rounded-md border object-cover" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "destructive", size: "icon", className: "absolute -top-2 -right-2 h-6 w-6 rounded-full z-10", onClick: () => setImageDataUri(null), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })), fileContent && fileName && !isOcrProcessing && ((0, jsx_runtime_1.jsxs)("div", { className: "relative mb-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md border", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 truncate", children: fileName }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => { setFileContent(null); setFileName(null); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleFormSubmit, className: "relative flex items-center rounded-full border bg-card p-2 shadow-lg focus-within:border-primary", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-9 w-9 flex-shrink-0", disabled: isInputDisabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Paperclip, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Attach file" })] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: handleOpenImageDialog, children: "Image" }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: handleOpenFileDialog, children: "Text File" })] })] }), (0, jsx_runtime_1.jsx)(input_1.Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: isOcrProcessing ? "Processing image..." : "Message SearnAI...", disabled: isInputDisabled, className: "h-10 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0" }), (0, jsx_runtime_1.jsx)("input", { type: "file", ref: fileInputRef, className: "hidden" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [toggleEditor && ((0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-9 w-9 flex-shrink-0 lg:hidden", onClick: toggleEditor, disabled: isInputDisabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Brush, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Open AI Editor" })] })), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: isRecording ? "destructive" : "ghost", className: "h-9 w-9 flex-shrink-0", onClick: handleToggleRecording, disabled: isInputDisabled, children: [isRecording ? (0, jsx_runtime_1.jsx)(lucide_react_1.MicOff, { className: "h-5 w-5" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: isRecording ? "Stop recording" : "Start recording" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", size: "icon", className: "h-9 w-9 flex-shrink-0", disabled: isInputDisabled || (!input.trim() && !imageDataUri && !fileContent), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Send" })] })] })] })] }) }));
}
