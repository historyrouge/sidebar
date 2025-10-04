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
exports.useChatStore = void 0;
exports.ChatContent = ChatContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const actions_1 = require("@/app/actions");
const avatar_1 = require("@/components/ui/avatar");
const button_1 = require("@/components/ui/button");
const scroll_area_1 = require("@/components/ui/scroll-area");
const use_toast_1 = require("@/hooks/use-toast");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const react_1 = __importStar(require("react"));
const react_markdown_1 = __importDefault(require("react-markdown"));
const remark_math_1 = __importDefault(require("remark-math"));
const rehype_katex_1 = __importDefault(require("rehype-katex"));
require("katex/dist/katex.min.css");
const share_dialog_1 = require("./share-dialog");
const image_1 = __importDefault(require("next/image"));
const limit_exhausted_dialog_1 = require("./limit-exhausted-dialog");
const navigation_1 = require("next/navigation");
const separator_1 = require("./ui/separator");
const textarea_1 = require("./ui/textarea");
const input_1 = require("./ui/input");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const model_switcher_1 = require("./model-switcher");
const zustand_1 = require("zustand");
const youtube_chat_card_1 = require("./youtube-chat-card");
const website_chat_card_1 = require("./website-chat-card");
const actions_2 = require("@/app/actions");
const models_1 = require("@/lib/models");
const generated_image_card_1 = require("./generated-image-card");
const thinking_indicator_1 = require("./thinking-indicator");
const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';
exports.useChatStore = (0, zustand_1.create)((set) => ({
    activeVideoId: null,
    activeVideoTitle: null,
    isPlaying: false,
    showPlayer: false,
    setActiveVideoId: (id, title) => set({ activeVideoId: id, activeVideoTitle: title, isPlaying: !!id, showPlayer: !!id }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setShowPlayer: (show) => set({ showPlayer: show }),
}));
const CodeBox = ({ language, code: initialCode }) => {
    const { toast } = (0, use_toast_1.useToast)();
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [code, setCode] = (0, react_1.useState)(initialCode);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: "Code has been copied to clipboard." });
    };
    const handleDownload = () => {
        const fileExtensions = {
            javascript: 'js',
            python: 'py',
            html: 'html',
            css: 'css',
            typescript: 'ts',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            csharp: 'cs',
            go: 'go',
            rust: 'rs',
            swift: 'swift',
            kotlin: 'kt',
            php: 'php',
            ruby: 'rb',
            perl: 'pl',
            shell: 'sh',
            sql: 'sql',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            markdown: 'md',
        };
        const extension = fileExtensions[language.toLowerCase()] || 'txt';
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        toast({ title: "Downloaded!", description: `Code saved as code.${extension}` });
    };
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "code-box", children: [(0, jsx_runtime_1.jsxs)("div", { className: "code-box-header", children: [(0, jsx_runtime_1.jsx)("span", { className: "code-box-language", children: language }), (0, jsx_runtime_1.jsxs)("div", { className: "code-box-actions", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: handleCopy, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "mr-1 h-4 w-4" }), " Copy"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: handleEditToggle, children: [isEditing ? (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "mr-1 h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "mr-1 h-4 w-4" }), isEditing ? 'Save' : 'Edit'] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: handleDownload, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "mr-1 h-4 w-4" }), " Download"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "ghost", size: "sm", disabled: true, children: "Run" })] })] }), isEditing ? ((0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: code, onChange: (e) => setCode(e.target.value), className: "font-mono text-sm bg-black/50 border-0 rounded-t-none h-64" })) : ((0, jsx_runtime_1.jsx)("pre", { children: (0, jsx_runtime_1.jsx)("code", { children: code }) }))] }));
};
function ChatContent() {
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const scrollAreaRef = (0, react_1.useRef)(null);
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const recognitionRef = (0, react_1.useRef)(null);
    const audioSendTimeoutRef = (0, react_1.useRef)(null);
    const [history, setHistory] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)("");
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const [isSynthesizing, setIsSynthesizing] = (0, react_1.useState)(null);
    const [shareContent, setShareContent] = (0, react_1.useState)(null);
    const [showLimitDialog, setShowLimitDialog] = (0, react_1.useState)(false);
    const [audioDataUri, setAudioDataUri] = (0, react_1.useState)(null);
    const audioRef = (0, react_1.useRef)(null);
    const [imageDataUri, setImageDataUri] = (0, react_1.useState)(null);
    const [fileContent, setFileContent] = (0, react_1.useState)(null);
    const [fileName, setFileName] = (0, react_1.useState)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const [isOcrProcessing, setIsOcrProcessing] = (0, react_1.useState)(false);
    const [ocrProgress, setOcrProgress] = (0, react_1.useState)(0);
    const [currentModel, setCurrentModel] = (0, react_1.useState)(models_1.DEFAULT_MODEL_ID);
    const [activeButton, setActiveButton] = (0, react_1.useState)(null);
    const { setActiveVideoId } = (0, exports.useChatStore)();
    const addMessageToHistory = (message) => {
        setHistory(prev => [...prev, message]);
    };
    const handleToolButtonClick = (tool) => {
        const newActiveButton = activeButton === tool ? null : tool;
        setActiveButton(newActiveButton);
        if (newActiveButton === 'deepthink') {
            setCurrentModel('gpt-oss-120b');
            toast({ title: 'Model Switched', description: 'DeepThink activated: Using SearnAI V3.1 for complex reasoning.' });
        }
        else if (newActiveButton === 'music') {
            toast({ title: 'Music Mode Activated', description: 'Search for a song to play it from YouTube.' });
        }
        else if (newActiveButton === 'image') {
            toast({ title: 'Image Mode Activated', description: 'Type a prompt to generate an image.' });
        }
        else {
            // Revert to default model if no special mode is active
            if (currentModel === 'gpt-oss-120b' && newActiveButton !== 'deepthink') {
                setCurrentModel('Llama-4-Maverick-17B-128E-Instruct');
            }
        }
    };
    (0, react_1.useEffect)(() => {
        try {
            const savedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        }
        catch (error) {
            console.error("Failed to load chat state from localStorage", error);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        try {
            localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
        }
        catch (error) {
            console.error("Failed to save chat history to localStorage", error);
        }
    }, [history]);
    const handleTextToSpeech = (0, react_1.useCallback)(async (text, id) => {
        if (isSynthesizing === id) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setAudioDataUri(null);
            setIsSynthesizing(null);
            return;
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsSynthesizing(id);
        setAudioDataUri(null);
        try {
            const result = await (0, actions_2.textToSpeechAction)({ text });
            if (result.error)
                throw new Error(result.error);
            if (result.data?.audioDataUri) {
                setAudioDataUri(result.data.audioDataUri);
            }
        }
        catch (e) {
            toast({ title: 'Audio Generation Failed', description: e.message, variant: 'destructive' });
            setIsSynthesizing(null);
        }
    }, [isSynthesizing, toast]);
    const executeChat = (0, react_1.useCallback)(async (currentHistory, currentImageDataUri, currentFileContent) => {
        setIsTyping(true);
        const genkitHistory = currentHistory.map(h => ({
            role: h.role,
            content: String(h.content),
        }));
        const result = await (0, actions_1.chatAction)({
            history: genkitHistory,
            fileContent: currentFileContent,
            imageDataUri: currentImageDataUri,
            model: currentModel,
            isMusicMode: activeButton === 'music',
        });
        setIsTyping(false);
        if (result.error) {
            toast({ title: "Chat Error", description: result.error, variant: 'destructive' });
        }
        else if (result.data) {
            const modelMessageId = `${Date.now()}-model`;
            setHistory(prev => [...prev, { id: modelMessageId, role: "model", content: result.data.response }]);
        }
    }, [currentModel, activeButton, toast]);
    const handleSendMessage = (0, react_1.useCallback)(async (messageContent) => {
        const messageToSend = messageContent ?? input;
        if (!messageToSend.trim() && !imageDataUri && !fileContent)
            return;
        if (isRecording) {
            recognitionRef.current?.stop();
        }
        const messageId = `${Date.now()}`;
        const userMessage = { id: messageId, role: "user", content: messageToSend, image: imageDataUri };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setInput("");
        const isImageGenRequest = activeButton === 'image';
        if (isImageGenRequest) {
            setIsTyping(true);
            const prompt = messageToSend.trim();
            const result = await (0, actions_1.generateImageAction)({ prompt });
            setIsTyping(false);
            if (result.error) {
                toast({ title: "Image Generation Error", description: result.error, variant: 'destructive' });
            }
            else if (result.data) {
                const imagePayload = {
                    type: 'image',
                    imageDataUri: result.data.imageDataUri,
                    prompt: prompt
                };
                const modelMessageId = `${Date.now()}-model`;
                setHistory(prev => [...prev, { id: modelMessageId, role: "model", content: JSON.stringify(imagePayload) }]);
            }
        }
        else {
            await executeChat(newHistory, imageDataUri, fileContent);
        }
        if (activeButton) {
            setActiveButton(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, isRecording, history, executeChat, imageDataUri, fileContent, activeButton]);
    const handleRegenerateResponse = async () => {
        const lastUserMessageIndex = history.findLastIndex(m => m.role === 'user');
        if (lastUserMessageIndex === -1)
            return;
        const historyForRegen = history.slice(0, lastUserMessageIndex + 1);
        setHistory(historyForRegen);
        const lastUserMessage = historyForRegen[lastUserMessageIndex];
        await executeChat(historyForRegen, lastUserMessage.image, fileContent);
    };
    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "The response has been copied to clipboard." });
    };
    const handleShare = (text) => {
        setShareContent(text);
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
                        handleSendMessage(finalTranscript);
                    }, 1000);
                }
            };
        }
        return () => {
            recognitionRef.current?.abort();
            if (audioSendTimeoutRef.current) {
                clearTimeout(audioSendTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === "text/plain") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFileContent(e.target?.result);
                    setFileName(file.name);
                    setImageDataUri(null);
                };
                reader.readAsText(file);
            }
            else {
                toast({ title: "Invalid file type", description: "Please upload a .txt file.", variant: "destructive" });
            }
        }
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const handleImageFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (!file.type.startsWith("image/")) {
            toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            const dataUri = reader.result;
            setImageDataUri(dataUri);
            setFileContent(null);
            setFileName(null);
            toast({
                title: "Image Attached",
                description: `You can now ask questions about the image.`,
            });
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const handleOpenFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = ".txt";
            fileInputRef.current.onchange = handleFileChange;
            fileInputRef.current.click();
        }
    };
    const handleOpenImageDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = "image/*";
            fileInputRef.current.onchange = handleImageFileChange;
            fileInputRef.current.click();
        }
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
    };
    (0, react_1.useEffect)(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }, [history]);
    const showWelcome = history.length === 0 && !isTyping;
    const isInputDisabled = isTyping || isOcrProcessing;
    const renderMessageContent = (message) => {
        const thinkMatch = message.content.match(/<think>([\s\S]*?)<\/think>/);
        const thinkingText = thinkMatch ? thinkMatch[1].trim() : null;
        const mainContent = thinkMatch ? message.content.replace(/<think>[\s\S]*?<\/think>/, '').trim() : message.content;
        try {
            const data = JSON.parse(mainContent);
            if (data.type === 'youtube' && data.videoId) {
                return (0, jsx_runtime_1.jsx)(youtube_chat_card_1.YoutubeChatCard, { videoData: data, onPin: () => setActiveVideoId(data.videoId, data.title) });
            }
            if (data.type === 'website' && data.url) {
                return (0, jsx_runtime_1.jsx)(website_chat_card_1.WebsiteChatCard, { websiteData: data });
            }
            if (data.type === 'image' && data.imageDataUri) {
                return (0, jsx_runtime_1.jsx)(generated_image_card_1.GeneratedImageCard, { imageDataUri: data.imageDataUri, prompt: data.prompt });
            }
        }
        catch (e) {
            // Not a JSON object, so render as plain text
        }
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [thinkingText && (0, jsx_runtime_1.jsx)(thinking_indicator_1.ThinkingIndicator, { text: thinkingText }), (0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: [remark_math_1.default], rehypePlugins: [rehype_katex_1.default], className: "prose dark:prose-invert max-w-none text-sm leading-relaxed", components: {
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? ((0, jsx_runtime_1.jsx)(CodeBox, { language: match[1], code: String(children).replace(/\n$/, '') })) : ((0, jsx_runtime_1.jsx)("code", { className: className, ...props, children: children }));
                        },
                        p: ({ node, ...props }) => (0, jsx_runtime_1.jsx)("p", { className: "mb-4", ...props }),
                    }, children: mainContent })] }));
    };
    if (showWelcome) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex h-full flex-col items-center justify-center p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-2xl mx-auto flex flex-col items-center gap-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-4xl font-bold", children: "SearnAI" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: "rounded-full", onClick: () => handleSendMessage('Generate a summary, highlights, and key insights'), children: "Generate a summary, highlights, and key insights" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: "rounded-full", onClick: () => handleSendMessage('Summarize core points and important details'), children: "Summarize core points and important details" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: "rounded-full", onClick: () => handleSendMessage('News'), children: "News" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-3xl", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-start mb-2 items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-muted/50 p-1 rounded-lg w-fit", children: (0, jsx_runtime_1.jsx)(model_switcher_1.ModelSwitcher, { selectedModel: currentModel, onModelChange: setCurrentModel, disabled: isInputDisabled }) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-muted/50 p-1 rounded-lg w-fit flex gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: activeButton === 'deepthink' ? 'default' : 'outline', onClick: () => handleToolButtonClick('deepthink'), children: "DeepThink" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: activeButton === 'music' ? 'default' : 'outline', disabled: isInputDisabled, onClick: () => handleToolButtonClick('music'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Music, { className: "h-5 w-5" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: activeButton === 'image' ? 'default' : 'outline', disabled: isInputDisabled, onClick: () => handleToolButtonClick('image'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Image, { className: "h-5 w-5" }) })] })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleFormSubmit, className: "relative w-full rounded-xl border border-border/10 bg-card/5 backdrop-blur-lg p-2 shadow-lg focus-within:border-primary flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-9 w-9 flex-shrink-0", disabled: isInputDisabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Paperclip, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Attach file" })] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: handleOpenImageDialog, children: "Image" }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: handleOpenFileDialog, children: "Text File" })] })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-9 w-9 flex-shrink-0", onClick: () => setInput("Search: "), disabled: isInputDisabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Search" })] }), (0, jsx_runtime_1.jsx)(input_1.Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Message SearnAI...", disabled: isInputDisabled, className: "h-10 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0" }), (0, jsx_runtime_1.jsx)("input", { type: "file", ref: fileInputRef, className: "hidden" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: isRecording ? "destructive" : "ghost", className: "h-9 w-9 flex-shrink-0", onClick: handleToggleRecording, disabled: isInputDisabled, children: [isRecording ? (0, jsx_runtime_1.jsx)(lucide_react_1.MicOff, { className: "h-5 w-5" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: isRecording ? "Stop recording" : "Start recording" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", size: "icon", className: "h-9 w-9 flex-shrink-0", disabled: isInputDisabled || (!input.trim() && !imageDataUri && !fileContent), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Send" })] })] })] })] })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsx)(limit_exhausted_dialog_1.LimitExhaustedDialog, { isOpen: showLimitDialog, onOpenChange: setShowLimitDialog }), (0, jsx_runtime_1.jsx)(share_dialog_1.ShareDialog, { isOpen: !!shareContent, onOpenChange: (open) => !open && setShareContent(null), content: shareContent || "" }), (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "flex-1", ref: scrollAreaRef, children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto w-full max-w-3xl space-y-8 p-4 pb-32", children: [history.map((message, index) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("flex w-full items-start gap-4", message.role === "user" ? "justify-end" : ""), children: message.role === "user" ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-4 justify-end", children: [(0, jsx_runtime_1.jsxs)("div", { className: "border bg-transparent inline-block rounded-xl p-3 max-w-md", children: [message.image && ((0, jsx_runtime_1.jsx)(image_1.default, { src: message.image, alt: "User upload", width: 200, height: 200, className: "rounded-md mb-2" })), (0, jsx_runtime_1.jsx)("p", { className: "text-base whitespace-pre-wrap", children: message.content })] }), (0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-9 w-9 border", children: (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "size-5" }) }) })] })) : ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("group w-full flex items-start gap-4"), children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full", children: [renderMessageContent(message), audioDataUri && isSynthesizing === message.id && ((0, jsx_runtime_1.jsx)("audio", { ref: audioRef, src: audioDataUri, autoPlay: true, onEnded: () => setIsSynthesizing(null), onPause: () => setIsSynthesizing(null) })), (0, jsx_runtime_1.jsxs)("div", { className: "mt-2 flex items-center gap-1 transition-opacity", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => handleCopyToClipboard(message.content), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => handleShare(message.content), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => handleTextToSpeech(message.content, message.id), children: isSynthesizing === message.id ? (0, jsx_runtime_1.jsx)(lucide_react_1.StopCircle, { className: "h-4 w-4 text-red-500" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Volume2, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-7 w-7", onClick: handleRegenerateResponse, disabled: isTyping, children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "h-4 w-4" }) })] })] }) })) }), index < history.length - 1 && ((0, jsx_runtime_1.jsx)(separator_1.Separator, { className: "my-8" }))] }, `${message.id}-${index}`))), isTyping && (0, jsx_runtime_1.jsx)(thinking_indicator_1.ThinkingIndicator, { text: "Thinking..." })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "fixed bottom-0 left-0 lg:left-[16rem] right-0 w-auto lg:w-[calc(100%-16rem)] group-data-[collapsible=icon]:lg:left-[3rem] group-data-[collapsible=icon]:lg:w-[calc(100%-3rem)] transition-all", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4 mx-auto max-w-3xl", children: [imageDataUri && ((0, jsx_runtime_1.jsxs)("div", { className: "relative mb-2 w-fit", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: imageDataUri, alt: "Image preview", width: 80, height: 80, className: "rounded-md border object-cover" }), isOcrProcessing && ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center justify-center bg-black/60 rounded-md", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-primary font-bold text-base drop-shadow-md", children: [Math.round(ocrProgress), "%"] }) })), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "destructive", size: "icon", className: "absolute -top-2 -right-2 h-6 w-6 rounded-full z-10", onClick: () => setImageDataUri(null), disabled: isOcrProcessing, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })), fileContent && fileName && !isOcrProcessing && ((0, jsx_runtime_1.jsxs)("div", { className: "relative mb-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md border", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 truncate", children: fileName }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => { setFileContent(null); setFileName(null); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-start mb-2 items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-muted/50 p-1 rounded-lg w-fit", children: (0, jsx_runtime_1.jsx)(model_switcher_1.ModelSwitcher, { selectedModel: currentModel, onModelChange: setCurrentModel, disabled: isInputDisabled }) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-muted/50 p-1 rounded-lg w-fit flex gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: activeButton === 'deepthink' ? 'default' : 'outline', onClick: () => handleToolButtonClick('deepthink'), children: "DeepThink" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: activeButton === 'music' ? 'default' : 'outline', disabled: isInputDisabled, onClick: () => handleToolButtonClick('music'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Music, { className: "h-5 w-5" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: activeButton === 'image' ? 'default' : 'outline', disabled: isInputDisabled, onClick: () => handleToolButtonClick('image'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Image, { className: "h-5 w-5" }) })] })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleFormSubmit, className: "relative flex items-center rounded-xl border border-border/10 bg-card/5 backdrop-blur-lg p-2 shadow-lg focus-within:border-primary", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-9 w-9 flex-shrink-0", disabled: isInputDisabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Paperclip, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Attach file" })] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: handleOpenImageDialog, children: "Image" }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onSelect: handleOpenFileDialog, children: "Text File" })] })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: "ghost", className: "h-9 w-9 flex-shrink-0", onClick: () => setInput("Search: "), disabled: isInputDisabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Search" })] }), (0, jsx_runtime_1.jsx)(input_1.Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Message SearnAI...", disabled: isInputDisabled, className: "h-10 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0" }), (0, jsx_runtime_1.jsx)("input", { type: "file", ref: fileInputRef, className: "hidden" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", size: "icon", variant: isRecording ? "destructive" : "ghost", className: "h-9 w-9 flex-shrink-0", onClick: handleToggleRecording, disabled: isInputDisabled, children: [isRecording ? (0, jsx_runtime_1.jsx)(lucide_react_1.MicOff, { className: "h-5 w-5" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: isRecording ? "Stop recording" : "Start recording" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", size: "icon", className: "h-9 w-9 flex-shrink-0", disabled: isInputDisabled || (!input.trim() && !imageDataUri && !fileContent), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Send" })] })] })] })] }) })] }));
}
