"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizStartContent = QuizStartContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const quiz_interface_1 = __importDefault(require("./quiz-interface"));
const navigation_1 = require("next/navigation");
const use_toast_1 = require("@/hooks/use-toast");
const alert_dialog_1 = require("./ui/alert-dialog");
const button_1 = require("./ui/button");
const back_button_1 = require("./back-button");
function QuizStartContent() {
    const [quizData, setQuizData] = (0, react_1.useState)(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = (0, react_1.useState)(0);
    const [answers, setAnswers] = (0, react_1.useState)({});
    const [showSubmitConfirm, setShowSubmitConfirm] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        try {
            const savedQuiz = localStorage.getItem('currentQuiz');
            if (savedQuiz) {
                const parsedData = JSON.parse(savedQuiz);
                // Ensure number of questions matches the options
                const trimmedQuizzes = parsedData.quizzes.slice(0, parsedData.options.numQuestions);
                setQuizData({ ...parsedData, quizzes: trimmedQuizzes });
            }
            else {
                router.push('/quiz');
                toast({ title: "No quiz found.", description: "Please generate a quiz first.", variant: "destructive" });
            }
        }
        catch (error) {
            router.push('/quiz');
            toast({ title: "Failed to load quiz.", description: "The quiz data appears to be corrupted.", variant: "destructive" });
        }
    }, [router, toast]);
    const handleAnswer = (answer) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    };
    const handleNext = () => {
        if (quizData && currentQuestionIndex < quizData.quizzes.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };
    const handleSubmit = () => {
        if (!quizData)
            return;
        const score = quizData.quizzes.reduce((acc, quiz, index) => {
            if (answers[index] === quiz.answer) {
                return acc + 1;
            }
            return acc;
        }, 0);
        try {
            const resultsData = {
                score,
                totalQuestions: quizData.quizzes.length,
                quizzes: quizData.quizzes,
                answers,
            };
            localStorage.setItem('quizResults', JSON.stringify(resultsData));
            // Cleanup current quiz from storage
            localStorage.removeItem('currentQuiz');
            router.push("/quiz/results");
        }
        catch (error) {
            toast({ title: "Error", description: "Could not save quiz results.", variant: "destructive" });
        }
    };
    const handleTimeUp = () => {
        toast({ title: "Time's up!", description: "Submitting your quiz now." });
        handleSubmit();
    };
    if (!quizData) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex h-screen w-full items-center justify-center", children: "Loading Quiz..." });
    }
    const currentQuestion = quizData.quizzes[currentQuestionIndex];
    if (!currentQuestion) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex h-screen w-full items-center justify-center", children: "Error: Question not found." });
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute top-4 left-4 z-[60]", children: (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}) }), (0, jsx_runtime_1.jsx)(quiz_interface_1.default, { subject: quizData.options.difficulty, durationSec: quizData.options.timeLimit, currentQuestion: currentQuestionIndex + 1, totalQuestions: quizData.quizzes.length, questionText: currentQuestion.question, options: currentQuestion.options, selectedAnswer: answers[currentQuestionIndex], onAnswer: handleAnswer, onNext: handleNext, onPrev: handlePrev, onSubmit: () => setShowSubmitConfirm(true), onTimeUp: handleTimeUp, autoStart: true }), (0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialog, { open: showSubmitConfirm, onOpenChange: setShowSubmitConfirm, children: (0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialogContent, { children: [(0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialogHeader, { children: [(0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialogTitle, { children: "Are you sure you want to submit?" }), (0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialogDescription, { children: "You cannot change your answers after submitting." })] }), (0, jsx_runtime_1.jsxs)(alert_dialog_1.AlertDialogFooter, { children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", onClick: () => setShowSubmitConfirm(false), children: "Cancel" }), (0, jsx_runtime_1.jsx)(alert_dialog_1.AlertDialogAction, { onClick: handleSubmit, children: "Submit" })] })] }) })] }));
}
