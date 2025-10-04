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
exports.HelpChatbot = HelpChatbot;
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
function HelpChatbot() {
    const [history, setHistory] = (0, react_1.useState)([
        { role: "model", content: "Hello! How can I help you use SearnAI today?" },
    ]);
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
        setHistory((prev) => [...prev, userMessage]);
        setInput("");
        startTyping(async () => {
            const chatInput = {
                history: [...history, userMessage],
            };
            const result = await (0, actions_1.helpChatAction)(chatInput);
            if (result.error) {
                toast({
                    title: "Chat Error",
                    description: result.error,
                    variant: "destructive",
                });
                setHistory((prev) => prev.slice(0, -1)); // Remove user message on error
            }
            else if (result.data) {
                const modelMessage = { role: "model", content: result.data.response };
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-[450px] flex-col rounded-lg border bg-background", children: [(0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "flex-1", ref: scrollAreaRef, children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 p-4", children: [history.map((message, index) => ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex items-start gap-3", message.role === "user" ? "justify-end" : ""), children: [message.role === "model" && ((0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-8 w-8", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { className: "bg-primary text-primary-foreground", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Bot, { className: "size-4" }) }) })), (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("max-w-xs rounded-lg p-3 text-sm", message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"), children: message.content }), message.role === "user" && ((0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-8 w-8", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "size-4" }) }) }))] }, index))), isTyping && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-8 w-8", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { className: "bg-primary text-primary-foreground", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Bot, { className: "size-4" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "size-4 animate-spin" }), (0, jsx_runtime_1.jsx)("span", { children: "Assistant is thinking..." })] })] }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "border-t p-4", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => handleSendMessage(e, input), className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask a question...", disabled: isTyping }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: isRecording ? "destructive" : "ghost", onClick: handleToggleRecording, disabled: isTyping, children: [isRecording ? (0, jsx_runtime_1.jsx)(lucide_react_1.MicOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: isRecording ? "Stop recording" : "Start recording" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", size: "icon", disabled: isTyping || !input.trim(), children: [isTyping ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-4 w-4" })), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Send" })] })] }) })] }));
}
