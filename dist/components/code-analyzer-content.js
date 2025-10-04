"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeAnalyzerContent = CodeAnalyzerContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const sidebar_1 = require("./ui/sidebar");
const back_button_1 = require("./back-button");
const select_1 = require("./ui/select");
const actions_1 = require("@/app/actions");
const accordion_1 = require("./ui/accordion");
const scroll_area_1 = require("./ui/scroll-area");
const skeleton_1 = require("./ui/skeleton");
const alert_1 = require("./ui/alert");
function CodeAnalyzerContent() {
    const [code, setCode] = (0, react_1.useState)("");
    const [language, setLanguage] = (0, react_1.useState)("python");
    const [analysis, setAnalysis] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [isAnalyzing, startAnalyzing] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const handleAnalyzeCode = () => {
        if (code.trim().length < 10) {
            toast({
                title: "Code too short",
                description: "Please provide at least 10 characters of code to analyze.",
                variant: "destructive",
            });
            return;
        }
        setError(null);
        setAnalysis(null);
        startAnalyzing(async () => {
            const result = await (0, actions_1.analyzeCodeAction)({ code, language });
            if (result.error) {
                setError(result.error);
                toast({ title: "Code Analysis Failed", description: "Please check the analysis panel for details.", variant: "destructive" });
            }
            else {
                setAnalysis(result.data ?? null);
                toast({ title: "Code Analyzed!", description: "The analysis is ready for review." });
            }
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Code Analyzer" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-2 h-full items-start", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Enter Your Code" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Paste your C++ or Python code below for an AI-powered analysis." })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "flex-1 flex flex-col gap-4", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: language, onValueChange: (v) => setLanguage(v), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select language" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "python", children: "Python" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "cpp", children: "C++" })] })] }), (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: `// Paste your ${language} code here...`, className: "h-full min-h-[400px] resize-none font-mono text-sm", value: code, onChange: (e) => setCode(e.target.value) })] }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleAnalyzeCode, disabled: isAnalyzing || code.trim().length < 10, children: [isAnalyzing ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Analyze Code"] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "h-full", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "AI Analysis" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Review the explanation, potential bugs, and optimizations." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-[520px] w-full", children: isAnalyzing ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 pr-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-1/3" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-16 w-full" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-1/3" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-20 w-full" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-1/3" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-20 w-full" })] })] })) : error ? ((0, jsx_runtime_1.jsxs)(alert_1.Alert, { variant: "destructive", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)(alert_1.AlertTitle, { children: "Code Analysis Failed" }), (0, jsx_runtime_1.jsx)(alert_1.AlertDescription, { children: error })] })) : analysis ? ((0, jsx_runtime_1.jsxs)(accordion_1.Accordion, { type: "multiple", defaultValue: ['explanation', 'bugs', 'optimizations'], className: "w-full pr-4 space-y-3", children: [(0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "explanation", className: "rounded-md border bg-background px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "text-base font-semibold hover:no-underline", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Code, { className: "h-5 w-5" }), "Explanation"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "pt-2 text-muted-foreground", children: analysis.explanation })] }), (0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "bugs", className: "rounded-md border bg-background px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "text-base font-semibold hover:no-underline", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bug, { className: "h-5 w-5 text-red-500" }), "Potential Bugs"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "pt-2 space-y-3", children: analysis.potentialBugs.length > 0 ? analysis.potentialBugs.map((b, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "p-3 rounded-md border border-red-500/20 bg-red-500/10", children: [(0, jsx_runtime_1.jsxs)("p", { className: "font-semibold text-red-700 dark:text-red-400", children: ["Bug: ", b.bug] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-muted-foreground mt-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-foreground", children: "Fix:" }), " ", b.fix] }), b.line && (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground mt-1", children: ["Line: ", b.line] })] }, i))) : (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "No potential bugs found. Great job!" }) })] }), (0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "optimizations", className: "rounded-md border bg-background px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "text-base font-semibold hover:no-underline", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "h-5 w-5 text-yellow-500" }), "Optimizations"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "pt-2 space-y-3", children: analysis.optimizations.length > 0 ? analysis.optimizations.map((o, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "p-3 rounded-md border border-yellow-500/20 bg-yellow-500/10", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-semibold text-yellow-700 dark:text-yellow-400", children: o.suggestion }), o.line && (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground mt-1", children: ["Line: ", o.line] })] }, i))) : (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "No specific optimizations suggested. The code looks clean." }) })] })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mx-auto h-12 w-12 text-muted-foreground" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-4 text-lg font-semibold", children: "Your analysis will appear here" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-muted-foreground", children: "Enter some code and click \"Analyze\" to begin." })] }) })) }) })] })] }) })] }));
}
