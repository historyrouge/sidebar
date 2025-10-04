"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizOptionsForm = QuizOptionsForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const use_toast_1 = require("@/hooks/use-toast");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const label_1 = require("@/components/ui/label");
const radio_group_1 = require("@/components/ui/radio-group");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
const back_button_1 = require("./back-button");
const actions_1 = require("@/app/actions");
function QuizOptionsForm() {
    const router = (0, navigation_1.useRouter)();
    const { toast } = (0, use_toast_1.useToast)();
    const [isGenerating, startGenerating] = (0, react_1.useTransition)();
    const [content, setContent] = (0, react_1.useState)(null);
    const [difficulty, setDifficulty] = (0, react_1.useState)("medium");
    const [numQuestions, setNumQuestions] = (0, react_1.useState)("10");
    const [timeLimit, setTimeLimit] = (0, react_1.useState)("10");
    // On component mount, retrieve the content from localStorage
    (0, react_1.useEffect)(() => {
        const savedContent = localStorage.getItem('quizContent');
        if (savedContent) {
            setContent(savedContent);
        }
        else {
            // If there's no content, the user shouldn't be on this page.
            toast({
                title: "No Content Found",
                description: "Please go back and provide some study material first.",
                variant: "destructive"
            });
            router.push('/quiz');
        }
    }, [router, toast]);
    const handleGenerateQuiz = () => {
        if (!content)
            return;
        startGenerating(async () => {
            const quizInput = {
                content,
                difficulty: difficulty,
                numQuestions: parseInt(numQuestions),
            };
            const result = await (0, actions_1.generateQuizAction)(quizInput);
            if (result.error) {
                toast({
                    title: "Could not generate quiz",
                    description: result.error,
                    variant: "destructive",
                });
                return;
            }
            if (result.data) {
                toast({ title: "Quiz Generated!", description: "Your quiz is ready. Redirecting..." });
                const quizData = {
                    quizzes: result.data.quizzes,
                    options: {
                        difficulty,
                        numQuestions: parseInt(numQuestions),
                        timeLimit: parseInt(timeLimit) * 60, // convert to seconds
                    }
                };
                localStorage.setItem('currentQuiz', JSON.stringify(quizData));
                router.push('/quiz/start');
            }
        });
    };
    if (!content) {
        // Render loading or a redirecting message
        return (0, jsx_runtime_1.jsx)("div", { className: "flex h-full items-center justify-center", children: "Loading content..." });
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center p-4 md:p-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "w-full max-w-2xl", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Customize Your Quiz" })] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Set the parameters for your quiz below. The quiz will be generated using Qwen." })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { className: "font-semibold", children: "Difficulty" }), (0, jsx_runtime_1.jsxs)(radio_group_1.RadioGroup, { defaultValue: "medium", value: difficulty, onValueChange: setDifficulty, className: "flex gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: "easy", id: "easy" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "easy", children: "Easy" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: "medium", id: "medium" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "medium", children: "Medium" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: "hard", id: "hard" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "hard", children: "Hard" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { className: "font-semibold", htmlFor: "num-questions", children: "Number of Questions" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: numQuestions, onValueChange: setNumQuestions, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { id: "num-questions", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select number of questions" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "5", children: "5 Questions" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "10", children: "10 Questions" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "15", children: "15 Questions" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "20", children: "20 Questions" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "25", children: "25 Questions" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "50", children: "50 Questions" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "100", children: "100 Questions" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { className: "font-semibold", htmlFor: "time-limit", children: "Time Limit" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: timeLimit, onValueChange: setTimeLimit, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { id: "time-limit", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select time limit" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "5", children: "5 Minutes" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "10", children: "10 Minutes" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "30", children: "30 Minutes" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "60", children: "60 Minutes" })] })] })] })] })] }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { className: "flex justify-end", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerateQuiz, disabled: isGenerating, children: [isGenerating && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Create Quiz"] }) })] }) }));
}
