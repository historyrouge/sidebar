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
exports.NewsReaderContent = NewsReaderContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const actions_1 = require("@/app/actions");
const avatar_1 = require("@/components/ui/avatar");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const scroll_area_1 = require("@/components/ui/scroll-area");
const use_toast_1 = require("@/hooks/use-toast");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const react_1 = __importStar(require("react"));
const marked_1 = require("marked");
const skeleton_1 = require("./ui/skeleton");
const image_1 = __importDefault(require("next/image"));
const navigation_1 = require("next/navigation");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
const dummyPrompts = [
    "Explain this in simple terms.",
    "What is the key takeaway from this?",
    "Who is most affected by this news?",
    "What could be the long-term impact?",
    "Summarize the main arguments in 3 bullet points.",
    "Are there any counter-arguments to this?",
];
function NewsReaderContent() {
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const scrollAreaRef = (0, react_1.useRef)(null);
    const [article, setArticle] = (0, react_1.useState)(null);
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [isSummarizing, startSummarizing] = (0, react_1.useTransition)();
    const [history, setHistory] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)("");
    const [isTyping, startTyping] = (0, react_1.useTransition)();
    // Load article from localStorage on mount
    (0, react_1.useEffect)(() => {
        try {
            const savedArticle = localStorage.getItem('selectedArticle');
            if (savedArticle) {
                const parsedArticle = JSON.parse(savedArticle);
                setArticle(parsedArticle);
                // Generate summary when article is loaded
                startSummarizing(async () => {
                    const contentToSummarize = parsedArticle.content || parsedArticle.description;
                    if (!contentToSummarize) {
                        setSummary({ summary: "No content available to summarize." });
                        return;
                    }
                    // News summarization always uses Qwen
                    const result = await (0, actions_1.summarizeContentAction)({ content: contentToSummarize });
                    if (result.error) {
                        toast({ title: "Summarization Failed", description: result.error, variant: "destructive" });
                    }
                    else {
                        setSummary(result.data ?? null);
                    }
                });
            }
            else {
                toast({ title: "No article selected", description: "Please go back and select an article.", variant: "destructive" });
                router.push('/news');
            }
        }
        catch (e) {
            toast({ title: "Failed to load article", description: "The article data is corrupted.", variant: "destructive" });
            router.push('/news');
        }
    }, [router, toast]);
    const handleSendMessage = (0, react_1.useCallback)(async (messageContent) => {
        const messageToSend = messageContent ?? input;
        if (!messageToSend.trim() || !article)
            return;
        const userMessage = { role: "user", content: messageToSend };
        setHistory((prev) => [...prev, userMessage]);
        setInput("");
        startTyping(async () => {
            const fullHistory = [...history, userMessage];
            const context = summary?.summary || article.description;
            const chatInput = {
                history: fullHistory,
                prompt: `The user is asking a follow-up question about the news article titled "${article.title}". Here is the article summary for context: "${context}".`,
                model: 'qwen'
            };
            // News chat uses Qwen
            const result = await (0, actions_1.generalChatAction)(chatInput);
            if (result.error) {
                toast({ title: "Chat Error", description: result.error, variant: "destructive" });
                setHistory((prev) => prev.filter(msg => msg !== userMessage));
            }
            else if (result.data) {
                const modelMessage = { role: "model", content: result.data.response };
                setHistory((prev) => [...prev, modelMessage]);
            }
        });
    }, [input, history, article, toast, summary]);
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
    };
    (0, react_1.useEffect)(() => {
        if (scrollAreaRef.current) {
            setTimeout(() => {
                const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
                if (viewport) {
                    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [history, isTyping]);
    if (!article) {
        return null; // Or a loading spinner, handled by the page's Suspense boundary
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "News Reader" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-8 lg:p-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-3xl mx-auto space-y-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-4xl font-bold tracking-tight", children: article.title }), article.urlToImage && ((0, jsx_runtime_1.jsx)("div", { className: "relative w-full aspect-video rounded-xl overflow-hidden border", children: (0, jsx_runtime_1.jsx)(image_1.default, { src: article.urlToImage, alt: article.title, fill: true, className: "object-cover" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold mb-3", children: "News Description" }), isSummarizing ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-5/6" })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "prose dark:prose-invert max-w-none text-muted-foreground", children: summary?.summary || "No summary available." }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-xl bg-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b", children: (0, jsx_runtime_1.jsx)("h3", { className: "font-semibold", children: "Ask Follow-up Questions" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "h-[32rem] flex flex-col", children: [(0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "flex-1 p-4", ref: scrollAreaRef, children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 pr-4", children: [history.map((message, index) => ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex items-start gap-4", message.role === "user" ? "justify-end" : ""), children: [message.role === "model" && ((0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-9 w-9 border", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { className: "bg-primary/10 text-primary", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Bot, { className: "size-5" }) }) })), (0, jsx_runtime_1.jsx)("div", { className: "max-w-lg", children: (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("rounded-xl p-3 text-sm", message.role === "user"
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "bg-muted"), children: (0, jsx_runtime_1.jsx)("div", { className: "prose dark:prose-invert prose-p:my-2 text-foreground", dangerouslySetInnerHTML: { __html: message.role === 'model' ? (0, marked_1.marked)(message.content) : message.content } }) }) }), message.role === "user" && ((0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-9 w-9 border", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "size-5" }) }) }))] }, index))), isTyping && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-4", children: [(0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-9 w-9 border", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { className: "bg-primary/10 text-primary", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Bot, { className: "size-5" }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "max-w-lg rounded-xl p-3 text-sm bg-muted flex items-center gap-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "size-4 animate-spin" }) })] })), history.length === 0 && !isTyping && ((0, jsx_runtime_1.jsxs)("div", { className: "pt-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "text-primary w-5 h-5" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-muted-foreground", children: "Try asking..." })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: dummyPrompts.map(prompt => ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: "h-auto text-left justify-start py-2", onClick: () => handleSendMessage(prompt), children: prompt }, prompt))) })] }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "p-4 border-t bg-background/80 rounded-b-lg", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleFormSubmit, className: "flex items-center gap-2 w-full", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask a follow-up question...", disabled: isTyping, className: "h-10 text-base" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", size: "icon", className: "h-10 w-10 flex-shrink-0", disabled: isTyping || !input.trim(), children: [isTyping ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-5 w-5" })), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Send" })] })] }) })] })] })] }) })] }));
}
