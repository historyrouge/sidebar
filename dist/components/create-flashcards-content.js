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
exports.CreateFlashcardsContent = CreateFlashcardsContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const actions_1 = require("@/app/actions");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const react_1 = __importStar(require("react"));
const flashcard_1 = require("./flashcard");
const scroll_area_1 = require("./ui/scroll-area");
const sidebar_1 = require("./ui/sidebar");
const back_button_1 = require("./back-button");
const dialog_1 = require("./ui/dialog");
const utils_1 = require("@/lib/utils");
const input_1 = require("./ui/input");
const navigation_1 = require("next/navigation");
const framer_motion_1 = require("framer-motion");
const stylePresets = [
    { id: 'colorful', name: 'Colorful', description: 'Bright and vibrant cards.' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple design.' },
    { id: 'neon', name: 'Dark Neon', description: 'Glowing text on dark cards.' },
    { id: 'pastel', name: 'Aesthetic', description: 'Soft and pleasing colors.' },
];
const numOptions = [5, 10, 20];
function CreateFlashcardsContent() {
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [step, setStep] = (0, react_1.useState)(0);
    const [userInput, setUserInput] = (0, react_1.useState)('');
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isProcessing, startProcessing] = (0, react_1.useTransition)();
    const [subject, setSubject] = (0, react_1.useState)('');
    const [topic, setTopic] = (0, react_1.useState)('');
    const [numCards, setNumCards] = (0, react_1.useState)(10);
    const [cardStyle, setCardStyle] = (0, react_1.useState)('colorful');
    const [generatedFlashcards, setGeneratedFlashcards] = (0, react_1.useState)(null);
    const [isGenerating, startGenerating] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const recognitionRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Browser does not support SpeechRecognition.");
            return;
        }
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => toast({ title: "Voice Error", description: e.error, variant: 'destructive' });
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
        };
    }, [toast]);
    const handleStartListening = () => {
        if (isListening || !recognitionRef.current)
            return;
        recognitionRef.current.start();
    };
    const resetFlow = () => {
        setStep(0);
        setUserInput('');
        setSubject('');
        setTopic('');
        setIsDialogOpen(true);
    };
    const handleNextStep = () => {
        startProcessing(() => {
            if (step === 0) { // Greeting
                setStep(1);
                return;
            }
            if (step === 1) { // Subject
                if (!userInput.trim()) {
                    toast({ title: "Please enter a subject.", variant: "destructive" });
                    return;
                }
                setSubject(userInput);
                setUserInput('');
                setStep(2);
            }
            else if (step === 2) { // Topic
                if (!userInput.trim()) {
                    toast({ title: "Please enter a topic.", variant: "destructive" });
                    return;
                }
                setTopic(userInput);
                setUserInput('');
                setStep(3);
            }
            else if (step === 3) { // Number of cards (Handled by button click)
                setStep(4);
            }
            else if (step === 4) { // Style (Handled by button click)
                setStep(5);
            }
            else if (step === 5) { // Confirmation
                setIsDialogOpen(false);
                handleGenerateFlashcards();
            }
        });
    };
    const handleGenerateFlashcards = () => {
        const content = `Subject: ${subject}. Topic: ${topic}. Please generate ${numCards} flashcards about this.`;
        startGenerating(async () => {
            const result = await (0, actions_1.generateFlashcardsAction)({ content });
            if (result.error) {
                toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
                setGeneratedFlashcards(null);
            }
            else {
                setGeneratedFlashcards(result.data?.flashcards ?? []);
                toast({ title: "Success!", description: "Your new flashcard deck is ready." });
            }
        });
    };
    const handlePlayQuiz = () => {
        if (!generatedFlashcards)
            return;
        const quizContent = `The flashcards are about ${subject}: ${topic}. Here are the questions and answers: ${generatedFlashcards.map(f => `${f.front}? ${f.back}`).join('\n')}`;
        try {
            localStorage.setItem('quizContent', quizContent);
            router.push('/quiz/options');
        }
        catch (e) {
            toast({
                title: "Could not start quiz",
                description: "There was an error preparing the quiz.",
                variant: "destructive",
            });
        }
    };
    const stepsContent = [
        {
            bot: "Hello! I'm here to help you create a new flashcard deck. Let's get started!",
            action: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleNextStep, className: "w-full justify-center", children: ["Let's go! ", (0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "ml-2 w-4 h-4" })] })
        },
        {
            bot: "First, what's the subject of your new deck? (e.g., Biology, History, JavaScript)",
            input: true
        },
        {
            bot: "Great! Now, what specific topic within that subject do you want to focus on?",
            input: true
        },
        {
            bot: `Awesome choice. How many flashcards would you like me to generate for "${topic}"?`,
            action: ((0, jsx_runtime_1.jsx)("div", { className: "flex gap-2", children: numOptions.map(num => (0, jsx_runtime_1.jsx)(button_1.Button, { className: "flex-1", variant: "outline", onClick: () => { setNumCards(num); handleNextStep(); }, children: num }, num)) }))
        },
        {
            bot: `Got it, ${numCards} cards. Now, pick a style for your deck. Which one do you like?`,
            action: ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3", children: stylePresets.map(s => ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "text-center rounded-lg bg-card/50 border-border/50 hover:border-primary/80 hover:bg-primary/10 cursor-pointer transition-all", onClick: () => { setCardStyle(s.id); handleNextStep(); }, children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-base", children: s.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: s.description })] }) }, s.id))) }))
        },
        {
            bot: ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: "Perfect! Here\u2019s what I\u2019ve got:" }), (0, jsx_runtime_1.jsxs)("ul", { className: "mt-2 text-sm list-disc list-inside bg-white/5 p-4 rounded-lg border border-white/10", children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Subject:" }), " ", subject] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Topic:" }), " ", topic] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Number of Cards:" }), " ", numCards] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Style:" }), " ", (0, jsx_runtime_1.jsx)("span", { className: "capitalize", children: cardStyle })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3", children: "Does that look right?" })] })),
            action: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleNextStep, className: "w-full justify-center", children: ["Looks Good, Generate! ", (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "ml-2 w-4 h-4" })] })
        },
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-black bg-grid-white/[0.05]", children: [(0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "sm:max-w-md bg-black/50 backdrop-blur-md border-white/10 text-white", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogTitle, { className: "flex items-center gap-2 font-normal text-lg", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bot, { className: "text-cyan-400" }), " Flashcard Assistant"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 py-4 min-h-[20rem] flex flex-col justify-between", children: [(0, jsx_runtime_1.jsx)("div", { className: "prose prose-sm prose-invert max-w-none", children: stepsContent[step]?.bot }), (0, jsx_runtime_1.jsx)("div", { children: stepsContent[step]?.input ? ((0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); handleNextStep(); }, className: "flex items-center gap-2 mt-4", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: userInput, onChange: (e) => setUserInput(e.target.value), placeholder: "Type your answer...", disabled: isProcessing, className: "bg-white/5 border-white/10 focus:ring-cyan-400" }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", variant: "ghost", type: "button", onClick: handleStartListening, disabled: isListening, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: (0, utils_1.cn)("w-4 h-4", isListening && "text-cyan-400 animate-pulse") }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", type: "submit", disabled: isProcessing, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "w-4 h-4" }) })] })) : stepsContent[step]?.action })] })] }) }), (0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight text-white/90", children: "Create Flashcards" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { mode: "wait", children: isGenerating ? ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "flex flex-col items-center justify-center h-full text-center text-muted-foreground", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "w-12 h-12 animate-spin text-cyan-400 mb-4" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold text-white", children: "Generating Your Deck..." }), (0, jsx_runtime_1.jsx)("p", { children: "The AI is working its magic. This might take a moment." })] }, "generating")) : generatedFlashcards ? ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8 text-center", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-3xl font-bold text-white", children: ["Your \"", topic, "\" Deck is Ready!"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "Click a card to flip it. What would you like to do next?" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 flex justify-center gap-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: resetFlow, className: "border-white/20 text-white/80 hover:bg-white/10 hover:text-white", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.PlusSquare, { className: "mr-2 h-4 w-4" }), " Create Another Deck"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handlePlayQuiz, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileQuestion, { className: "mr-2 h-4 w-4" }), " Play Quiz Mode"] })] })] }), (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-[calc(100vh-22rem)]", children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 gap-6 pr-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", children: generatedFlashcards.map((card, i) => (0, jsx_runtime_1.jsx)(flashcard_1.Flashcard, { ...card }, i)) }) })] }, "results")) : ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex h-full min-h-[300px] items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BookCopy, { className: "mx-auto h-16 w-16 text-muted-foreground" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-4 text-2xl font-semibold text-white", children: "Create a New Flashcard Deck" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-muted-foreground", children: "Click the button below to start a conversation with our AI assistant to build your deck." }), (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "lg", className: "mt-6", onClick: () => setIsDialogOpen(true), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "mr-2 h-5 w-5" }), "Start Creating"] })] }) }, "initial")) }) })] }));
}
