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
exports.QuizGenerator = QuizGenerator;
const jsx_runtime_1 = require("react/jsx-runtime");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
function QuizGenerator() {
    const [content, setContent] = (0, react_1.useState)("");
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const recognitionRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event) => {
                toast({ title: "Speech Recognition Error", description: event.error, variant: "destructive" });
                setIsRecording(false);
            };
            recognition.onresult = (event) => {
                let fullTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        fullTranscript += event.results[i][0].transcript;
                    }
                }
                if (fullTranscript) {
                    setContent(prev => prev + fullTranscript + ' ');
                }
            };
        }
    }, [toast]);
    const handleToggleRecording = () => {
        if (!recognitionRef.current) {
            toast({
                title: "Browser Not Supported",
                description: "Your browser does not support voice-to-text.",
                variant: "destructive",
            });
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
        }
        else {
            recognitionRef.current.start();
        }
    };
    const handleProceedToOptions = () => {
        if (content.trim().length < 50) {
            toast({
                title: "Content too short",
                description: "Please provide at least 50 characters to generate a quiz.",
                variant: "destructive",
            });
            return;
        }
        // We will store the content in localStorage to pass it to the next page.
        // This is simpler than passing potentially very long text in a URL.
        try {
            localStorage.setItem('quizContent', content);
            router.push('/quiz/options');
        }
        catch (e) {
            toast({
                title: "Could not save content",
                description: "There was an error while trying to proceed. Please try again.",
                variant: "destructive",
            });
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-col h-full", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex flex-col flex-1 lg:col-span-2", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Generate a Quiz" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Paste your study material below to begin creating your quiz." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "flex-1", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative h-full", children: [(0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "Paste your content here...", className: "h-full min-h-[300px] resize-none pr-10", value: content, onChange: (e) => setContent(e.target.value) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "icon", variant: isRecording ? 'destructive' : 'ghost', onClick: handleToggleRecording, className: "absolute bottom-3 right-3", children: [isRecording ? (0, jsx_runtime_1.jsx)(lucide_react_1.MicOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: isRecording ? 'Stop recording' : 'Start recording' })] })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleProceedToOptions, disabled: content.trim().length < 50, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Proceed to Quiz Options"] }) })] }) }));
}
