"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindMapContent = MindMapContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const sidebar_1 = require("./ui/sidebar");
const back_button_1 = require("./back-button");
const actions_1 = require("@/app/actions");
const scroll_area_1 = require("./ui/scroll-area");
const alert_1 = require("./ui/alert");
function MindMapContent() {
    const [content, setContent] = (0, react_1.useState)("");
    const [mindMap, setMindMap] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [isGenerating, startGenerating] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const handleGenerate = () => {
        if (content.trim().length < 50) {
            toast({
                title: "Content too short",
                description: "Please provide at least 50 characters to generate a mind map.",
                variant: "destructive",
            });
            return;
        }
        setError(null);
        setMindMap(null);
        startGenerating(async () => {
            const result = await (0, actions_1.generateMindMapAction)({ content });
            if (result.error) {
                setError(result.error);
                toast({ title: "Mind Map Generation Failed", description: "Please check the panel for details.", variant: "destructive" });
            }
            else {
                setMindMap(result.data ?? null);
                toast({ title: "Mind Map Generated!", description: "Your mind map is ready for review." });
            }
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Mind Map Creator" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-8 xl:grid-cols-3 h-full items-start", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex flex-col h-full xl:col-span-1", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Enter Your Content" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Paste your study material below to generate a structured mind map using our AI." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "flex-1 flex flex-col", children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "Paste your content here...", className: "h-full min-h-[400px] resize-none", value: content, onChange: (e) => setContent(e.target.value) }) }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerate, disabled: isGenerating || content.trim().length < 50, children: [isGenerating ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Generate Mind Map"] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "xl:col-span-2 h-full", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "h-full", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Generated Mind Map" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Explore your content in a visual, hierarchical structure." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-[calc(100vh-20rem)] w-full", children: isGenerating ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-6 pr-4 flex items-center justify-center h-full", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-primary mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-muted-foreground", children: "Generating your mind map..." })] }) })) : error ? ((0, jsx_runtime_1.jsxs)(alert_1.Alert, { variant: "destructive", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)(alert_1.AlertTitle, { children: "Generation Failed" }), (0, jsx_runtime_1.jsxs)(alert_1.AlertDescription, { children: ["The AI model could not generate a mind map. This might be due to an invalid API key or a network issue. Please check your configuration and try again.", (0, jsx_runtime_1.jsxs)("p", { className: "text-xs font-mono mt-2 bg-destructive/10 p-2 rounded", children: ["Error: ", error] })] })] })) : mindMap ? ((0, jsx_runtime_1.jsx)("div", { className: "pr-4", children: (0, jsx_runtime_1.jsx)(card_1.Card, { className: "bg-muted/50 p-4", children: (0, jsx_runtime_1.jsx)("pre", { className: "font-mono text-xs whitespace-pre-wrap break-words", children: mindMap.mindmapText }) }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BrainCircuit, { className: "mx-auto h-12 w-12 text-muted-foreground" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-4 text-lg font-semibold", children: "Your mind map will appear here" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-muted-foreground", children: "Enter some content and click \"Generate\" to begin." })] }) })) }) })] }) })] }) })] }));
}
