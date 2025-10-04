"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeExtractorContent = YouTubeExtractorContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const actions_1 = require("@/app/actions");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const back_button_1 = require("./back-button");
const skeleton_1 = require("./ui/skeleton");
const sidebar_1 = require("./ui/sidebar");
function YouTubeExtractorContent() {
    const [videoUrl, setVideoUrl] = (0, react_1.useState)("");
    const [transcript, setTranscript] = (0, react_1.useState)("");
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [isExtracting, startExtracting] = (0, react_1.useTransition)();
    const [isSummarizing, startSummarizing] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const handleExtractTranscript = () => {
        if (!videoUrl.trim()) {
            toast({ title: "Please enter a YouTube URL", variant: 'destructive' });
            return;
        }
        startExtracting(async () => {
            setTranscript("");
            setSummary(null);
            const result = await (0, actions_1.getYoutubeTranscriptAction)({ videoUrl });
            if (result.error) {
                toast({ title: "Failed to get transcript", description: result.error, variant: 'destructive' });
            }
            else if (result.data) {
                setTranscript(result.data.transcript);
                toast({ title: "Transcript extracted successfully!" });
            }
        });
    };
    const handleSummarize = () => {
        if (!transcript) {
            toast({ title: "No transcript available", description: "Please extract a transcript first.", variant: 'destructive' });
            return;
        }
        startSummarizing(async () => {
            const result = await (0, actions_1.summarizeContentAction)({ content: transcript });
            if (result.error) {
                toast({ title: "Summarization Failed", description: result.error, variant: "destructive" });
            }
            else {
                setSummary(result.data ?? null);
            }
        });
    };
    const handleCopyToClipboard = (textToCopy, type) => {
        if (!textToCopy.trim()) {
            toast({ title: `No ${type} to copy`, variant: 'destructive' });
            return;
        }
        navigator.clipboard.writeText(textToCopy);
        toast({ title: `Copied to clipboard!`, description: `The ${type} has been copied.` });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "YouTube Tools" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-2xl space-y-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "YouTube Transcript Extractor" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Paste a YouTube video URL to get its full transcript." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex w-full items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "https://www.youtube.com/watch?v=...", value: videoUrl, onChange: (e) => setVideoUrl(e.target.value), disabled: isExtracting }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleExtractTranscript, disabled: isExtracting || !videoUrl.trim(), children: [isExtracting ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2" }), "Extract"] })] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Extracted Transcript" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "The transcript will appear below. You can copy it or generate a summary." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "Transcript will appear here...", className: "h-64 resize-none", value: transcript, readOnly: true }) }), (0, jsx_runtime_1.jsxs)(card_1.CardFooter, { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => handleCopyToClipboard(transcript, "transcript"), disabled: isExtracting || !transcript.trim(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "mr-2" }), "Copy Transcript"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleSummarize, disabled: isSummarizing || !transcript.trim(), children: [isSummarizing ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Pilcrow, { className: "mr-2" }), "Summarize"] })] })] }), (isSummarizing || summary) && ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Video Summary" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "An AI-generated summary of the video's content." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: isSummarizing ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-3/4" })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: summary?.summary })) }), summary && ((0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: () => handleCopyToClipboard(summary.summary, "summary"), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "mr-2" }), "Copy Summary"] }) }))] }))] }) })] }));
}
