"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizResultsContent = QuizResultsContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const use_toast_1 = require("@/hooks/use-toast");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const progress_1 = require("@/components/ui/progress");
const accordion_1 = require("./ui/accordion");
const utils_1 = require("@/lib/utils");
const link_1 = __importDefault(require("next/link"));
const back_button_1 = require("./back-button");
function QuizResultsContent() {
    const [results, setResults] = (0, react_1.useState)(null);
    const router = (0, navigation_1.useRouter)();
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        try {
            const savedResults = localStorage.getItem('quizResults');
            if (savedResults) {
                setResults(JSON.parse(savedResults));
            }
            else {
                toast({ title: "No results found.", description: "Please complete a quiz to see your results.", variant: "destructive" });
                router.push('/quiz');
            }
        }
        catch (error) {
            toast({ title: "Failed to load results.", description: "The results data appears to be corrupted.", variant: "destructive" });
            router.push('/quiz');
        }
    }, [router, toast]);
    const getStarRating = (percentage) => {
        if (percentage >= 90)
            return 5;
        if (percentage >= 80)
            return 4;
        if (percentage >= 70)
            return 3;
        if (percentage >= 60)
            return 2;
        if (percentage >= 50)
            return 1;
        return 0;
    };
    if (!results) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex h-full items-center justify-center", children: "Loading results..." });
    }
    const { score, totalQuestions, quizzes, answers } = results;
    const percentage = Math.round((score / totalQuestions) * 100);
    const stars = getStarRating(percentage);
    return ((0, jsx_runtime_1.jsx)("div", { className: "container mx-auto max-w-4xl py-8", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "relative", children: [(0, jsx_runtime_1.jsx)(back_button_1.BackButton, { className: "absolute top-4 left-4" }), (0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "text-center", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-4xl font-bold", children: "Quiz Complete!" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "text-xl text-muted-foreground", children: "Here's how you did." })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: Array.from({ length: 5 }).map((_, i) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: (0, utils_1.cn)("h-10 w-10", i < stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30") }, i))) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-6xl font-bold", children: [percentage, "%"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-lg text-muted-foreground", children: ["You answered ", score, " out of ", totalQuestions, " questions correctly."] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: percentage, className: "w-full max-w-md" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-semibold mb-4", children: "Review Your Answers" }), (0, jsx_runtime_1.jsx)(accordion_1.Accordion, { type: "single", collapsible: true, className: "w-full space-y-2", children: quizzes.map((q, i) => {
                                        const userAnswer = answers[i];
                                        const isCorrect = userAnswer === q.answer;
                                        return ((0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: `item-${i}`, className: "rounded-md border bg-background px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [isCorrect ? (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-5 w-5 text-red-500" }), (0, jsx_runtime_1.jsxs)("span", { children: [i + 1, ". ", q.question] })] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 pb-4", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-muted-foreground", children: ["Your answer: ", (0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)(isCorrect ? "text-green-600" : "text-red-600", "font-semibold"), children: userAnswer || "Not answered" })] }), !isCorrect && (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-muted-foreground", children: ["Correct answer: ", (0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-green-600", children: q.answer })] })] }) })] }, q.question));
                                    }) })] })] }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { className: "justify-center", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/quiz", children: (0, jsx_runtime_1.jsx)(button_1.Button, { size: "lg", children: "Take Another Quiz" }) }) })] }) }));
}
