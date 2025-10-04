"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionPaperContent = QuestionPaperContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const sidebar_1 = require("./ui/sidebar");
const back_button_1 = require("./back-button");
const actions_1 = require("@/app/actions");
const alert_1 = require("./ui/alert");
const skeleton_1 = require("./ui/skeleton");
function QuestionPaperContent() {
    const [className, setClassName] = (0, react_1.useState)("");
    const [subject, setSubject] = (0, react_1.useState)("");
    const [topic, setTopic] = (0, react_1.useState)("");
    const [error, setError] = (0, react_1.useState)(null);
    const [isGenerating, startGenerating] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const handleGenerate = () => {
        if (!className || !subject || !topic) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields to generate a paper.",
                variant: "destructive",
            });
            return;
        }
        setError(null);
        startGenerating(async () => {
            const result = await (0, actions_1.generateQuestionPaperAction)({ className, subject, topic });
            if (result.error) {
                setError(result.error);
                toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
            }
            else if (result.data) {
                try {
                    localStorage.setItem('questionPaper', JSON.stringify(result.data));
                    toast({ title: "Paper Generated!", description: "Redirecting to viewer..." });
                    router.push('/question-paper/view');
                }
                catch (e) {
                    setError("Could not store the generated paper. Please try again.");
                    toast({ title: "Storage Error", description: "Could not store the generated paper.", variant: "destructive" });
                }
            }
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Question Paper Generator" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)("div", { className: "mx-auto max-w-xl", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Paper Details" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Provide the details for your question paper. The generator uses a SambaNova model to create a paper based on the CBSE pattern." })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [isGenerating ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center space-y-4 py-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-primary" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "Generating your paper, please wait..." }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-3/4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-1/2" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "class", children: "Class" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "class", placeholder: "e.g., 10th, 12th", value: className, onChange: e => setClassName(e.target.value) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "subject", children: "Subject" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "subject", placeholder: "e.g., Physics", value: subject, onChange: e => setSubject(e.target.value) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "topic", children: "Topic / Chapter" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "topic", placeholder: "e.g., Light and Optics", value: topic, onChange: e => setTopic(e.target.value) })] })] })), error && ((0, jsx_runtime_1.jsxs)(alert_1.Alert, { variant: "destructive", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)(alert_1.AlertTitle, { children: "Generation Failed" }), (0, jsx_runtime_1.jsx)(alert_1.AlertDescription, { children: error })] }))] }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerate, disabled: isGenerating, className: "w-full", children: [isGenerating ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Generate Paper"] }) })] }) }) })] }));
}
