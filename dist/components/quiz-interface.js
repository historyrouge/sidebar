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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuizInterface;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const progress_1 = require("@/components/ui/progress");
const utils_1 = require("@/lib/utils");
const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
};
function QuizInterface(props) {
    const { subject = "Mathematics", totalQuestions = 20, currentQuestion = 1, durationSec = 15 * 60, autoStart = true, questionText = "What is 2 + 2?", options = ["2", "3", "4", "5"], selectedAnswer, onAnswer, onTimeUp, onNext, onPrev, onSubmit, isDemo = false, } = props;
    const [remaining, setRemaining] = (0, react_1.useState)(durationSec);
    const [running, setRunning] = (0, react_1.useState)(autoStart);
    const intervalRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        setRemaining(durationSec);
        setRunning(autoStart);
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [durationSec, autoStart]);
    (0, react_1.useEffect)(() => {
        if (!running || remaining <= 0 || isDemo)
            return;
        intervalRef.current = window.setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    window.clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    onTimeUp?.();
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [running, remaining, onTimeUp, isDemo]);
    const progress = (0, react_1.useMemo)(() => {
        const used = durationSec - remaining;
        return Math.max(0, Math.min(100, (used / durationSec) * 100));
    }, [durationSec, remaining]);
    const questionProgress = (0, react_1.useMemo)(() => {
        return Math.max(0, Math.min(100, (currentQuestion / totalQuestions) * 100));
    }, [currentQuestion, totalQuestions]);
    const isLastQuestion = currentQuestion === totalQuestions;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-background text-foreground", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sticky top-0 z-50 backdrop-blur bg-background/80 border-b", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 w-full sm:w-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-5 h-5", "aria-hidden": true }), (0, jsx_runtime_1.jsx)("div", { className: "font-semibold tabular-nums", children: formatTime(remaining) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2 ml-auto sm:ml-2", children: (0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: running ? "secondary" : "default", onClick: () => setRunning((s) => !s), className: "rounded-full px-4", children: running ? "Pause" : "Resume" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 capitalize", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BookOpen, { className: "w-5 h-5", "aria-hidden": true }), (0, jsx_runtime_1.jsx)("span", { className: "px-3 py-1 rounded-full bg-muted text-sm font-medium", children: subject })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Hash, { className: "w-5 h-5", "aria-hidden": true }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm font-semibold", children: ["Q ", currentQuestion, " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-muted-foreground", children: ["/ ", totalQuestions] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-1 w-full bg-muted", children: (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: progress, className: "h-1 rounded-none bg-primary" }) })] }), (0, jsx_runtime_1.jsxs)("main", { className: "mx-auto max-w-5xl px-4 py-8", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { mode: "wait", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 }, children: (0, jsx_runtime_1.jsx)(card_1.Card, { className: "rounded-2xl shadow-lg border-0 bg-card", children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-8", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-xl font-semibold mb-2", children: ["Question ", currentQuestion] }), (0, jsx_runtime_1.jsx)("p", { className: "text-foreground/90 mb-8 text-lg", children: questionText }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: options.map((opt, idx) => ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: (0, utils_1.cn)("w-full h-auto py-4 justify-start rounded-xl text-base border-border/50 hover:bg-primary/10 hover:border-primary", selectedAnswer === opt && "bg-primary/20 border-primary"), onClick: () => onAnswer?.(opt), children: opt }, idx))) })] }) }) }, currentQuestion) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-8 flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: onPrev, variant: "secondary", disabled: currentQuestion === 1, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "mr-2" }), "Previous"] }), isLastQuestion ? ((0, jsx_runtime_1.jsx)(button_1.Button, { onClick: onSubmit, size: "lg", className: "bg-green-600 hover:bg-green-700", children: "Submit Quiz" })) : ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: onNext, disabled: selectedAnswer === undefined, children: ["Next", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "ml-2" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm text-muted-foreground mb-2", children: [(0, jsx_runtime_1.jsx)("span", { children: "Question Progress" }), (0, jsx_runtime_1.jsxs)("span", { children: [currentQuestion, " / ", totalQuestions] })] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: questionProgress, className: "h-2 rounded-full" })] })] })] }));
}
