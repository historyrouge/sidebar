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
exports.TutorChat = TutorChat;
const jsx_runtime_1 = require("react/jsx-runtime");
const avatar_1 = require("@/components/ui/avatar");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const scroll_area_1 = require("@/components/ui/scroll-area");
const use_toast_1 = require("@/hooks/use-toast");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const react_1 = __importStar(require("react"));
const marked_1 = require("marked");
const TutorResponse = ({ message }) => {
    const finalHtml = (0, marked_1.marked)(message.content);
    return ((0, jsx_runtime_1.jsx)("div", { className: "prose dark:prose-invert max-w-none text-base leading-relaxed text-foreground", dangerouslySetInnerHTML: { __html: finalHtml } }));
};
function TutorChat({ content, onSendMessage }) {
    const [history, setHistory] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)("");
    const [isTyping, startTyping] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const scrollAreaRef = (0, react_1.useRef)(null);
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const recognitionRef = (0, react_1.useRef)(null);
    const audioSendTimeoutRef = (0, react_1.useRef)(null);
    const handleSendMessage = async (e, message) => {
        e?.preventDefault();
        const messageToSend = message || input;
        if (!messageToSend.trim())
            return;
        if (isRecording) {
            recognitionRef.current?.stop();
        }
        const userMessage = { role: "user", content: messageToSend };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setInput("");
        startTyping(async () => {
            const result = await onSendMessage(newHistory.map(h => ({ role: h.role, content: h.content })));
            if (result.error) {
                toast({
                    title: "Tutor Error",
                    description: result.error,
                    variant: "destructive",
                });
                setHistory((prev) => prev.slice(0, -1)); // Remove user message on error
            }
            else if (result.data) {
                const modelMessage = {
                    role: "model",
                    content: result.data.response,
                };
                setHistory((prev) => [...prev, modelMessage]);
            }
        });
    };
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
                if (audioSendTimeoutRef.current) {
                    clearTimeout(audioSendTimeoutRef.current);
                }
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript = event.results[i][0].transcript;
                    }
                    else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setInput(interimTranscript);
                if (finalTranscript.trim()) {
                    setInput(finalTranscript);
                    audioSendTimeoutRef.current = setTimeout(() => {
                        handleSendMessage(null, finalTranscript);
                    }, 1000);
                }
            };
        }
        return () => {
            if (audioSendTimeoutRef.current) {
                clearTimeout(audioSendTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history]);
    const handleToggleRecording = () => {
        if (!recognitionRef.current)
            return;
        if (isRecording) {
            recognitionRef.current.stop();
        }
        else {
            setInput("");
            recognitionRef.current.start();
        }
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
    }, [history]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "flex-1", ref: scrollAreaRef, children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 p-4 pr-6", children: [history.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GraduationCap, { className: "w-12 h-12 mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "AI Tutor" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "Ask me anything about the study material you've provided. I'm here to help you understand it better!" })] })), history.map((message, index) => ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex w-full items-start gap-3", message.role === "user" ? "justify-end" : ""), children: [message.role === 'model' && ((0, jsx_runtime_1.jsx)("div", { className: "w-full", children: (0, jsx_runtime_1.jsx)(TutorResponse, { message: message }) })), message.role === 'user' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("max-w-md", "rounded-lg bg-muted text-foreground p-3 text-base"), children: message.content }), (0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-8 w-8", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, {}) }) })] }))] }, index))), isTyping && history[history.length - 1]?.role !== 'model' && ((0, jsx_runtime_1.jsx)("div", { className: "flex items-start gap-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "size-4 animate-spin" }), (0, jsx_runtime_1.jsx)("span", { children: "Tutor is thinking..." })] }) }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "border-t p-4", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => handleSendMessage(e, input), className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask a question about your material...", disabled: isTyping || !content, title: !content ? "Please analyze some material first" : "" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: isRecording ? "destructive" : "ghost", onClick: handleToggleRecording, disabled: isTyping || !content, children: [isRecording ? (0, jsx_runtime_1.jsx)(lucide_react_1.MicOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: isRecording ? "Stop recording" : "Start recording" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", size: "icon", disabled: isTyping || !input.trim() || !content, children: [isTyping ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-4 w-4" })), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Send" })] })] }) })] }));
}
