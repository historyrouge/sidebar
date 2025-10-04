"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiEditorContent = AiEditorContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const sidebar_1 = require("./ui/sidebar");
const back_button_1 = require("./back-button");
const lucide_react_1 = require("lucide-react");
const textarea_1 = require("./ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const actions_1 = require("@/app/actions");
const skeleton_1 = require("./ui/skeleton");
const alert_1 = require("./ui/alert");
function AiEditorContent({ embedded }) {
    const [instruction, setInstruction] = (0, react_1.useState)("");
    const [inputContent, setInputContent] = (0, react_1.useState)("");
    const [outputContent, setOutputContent] = (0, react_1.useState)("");
    const [isGenerating, startGenerating] = (0, react_1.useTransition)();
    const [error, setError] = (0, react_1.useState)(null);
    const { toast } = (0, use_toast_1.useToast)();
    const handleGenerate = () => {
        if (!instruction.trim()) {
            toast({ title: "Instruction missing", description: "Please provide an instruction for the AI.", variant: "destructive" });
            return;
        }
        setError(null);
        setOutputContent("");
        startGenerating(async () => {
            const result = await (0, actions_1.generateEditedContentAction)({ instruction, content: inputContent });
            if (result.error) {
                setError(result.error);
            }
            else if (result.data) {
                setOutputContent(result.data.editedContent);
            }
        });
    };
    const handleCopyToClipboard = () => {
        if (!outputContent)
            return;
        navigator.clipboard.writeText(outputContent);
        toast({ title: "Copied!", description: "The generated content has been copied." });
    };
    const header = !embedded && ((0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "AI Editor" })] }) }));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [header, (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "h-full w-full space-y-4", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: "p-4", children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-base", children: "1. Your Instruction" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4 pt-0", children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "e.g., 'Fix grammar and spelling', 'Write a Python function that returns a list of prime numbers up to n', or 'Convert this to a professional email'", value: instruction, onChange: (e) => setInstruction(e.target.value), className: "h-24 resize-none" }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: "p-4", children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-base", children: "2. Input Content (Optional)" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4 pt-0", children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "Paste your text or code here for the AI to edit or analyze...", value: inputContent, onChange: (e) => setInputContent(e.target.value), className: "h-40 resize-none" }) })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerate, disabled: isGenerating || !instruction.trim(), className: "w-full", children: [isGenerating ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Generate"] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "p-4 flex-row items-center justify-between", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-base", children: "3. AI Generated Output" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: handleCopyToClipboard, disabled: !outputContent, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-4 w-4" }) })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4 pt-0", children: isGenerating ? ((0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-40 w-full" })) : error ? ((0, jsx_runtime_1.jsxs)(alert_1.Alert, { variant: "destructive", children: [(0, jsx_runtime_1.jsx)(alert_1.AlertTitle, { children: "Generation Failed" }), (0, jsx_runtime_1.jsx)(alert_1.AlertDescription, { children: error })] })) : ((0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "The AI's response will appear here...", value: outputContent, readOnly: true, className: "h-40 resize-none bg-muted/50" })) })] })] }) })] }));
}
