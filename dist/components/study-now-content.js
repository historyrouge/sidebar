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
exports.StudyNowContent = StudyNowContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const actions_1 = require("@/app/actions");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const scroll_area_1 = require("@/components/ui/scroll-area");
const skeleton_1 = require("@/components/ui/skeleton");
const tabs_1 = require("@/components/ui/tabs");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const react_1 = __importStar(require("react"));
const flashcard_1 = require("./flashcard");
const sidebar_1 = require("./ui/sidebar");
const accordion_1 = require("./ui/accordion");
const tutor_chat_1 = require("./tutor-chat");
const navigation_1 = require("next/navigation");
const input_1 = require("./ui/input");
const image_1 = __importDefault(require("next/image"));
const image_to_data_uri_1 = __importDefault(require("image-to-data-uri"));
const back_button_1 = require("./back-button");
const dialog_1 = require("./ui/dialog");
const alert_1 = require("./ui/alert");
function StudyNowContent() {
    const [content, setContent] = (0, react_1.useState)("");
    const [title, setTitle] = (0, react_1.useState)("");
    const [analysis, setAnalysis] = (0, react_1.useState)(null);
    const [flashcards, setFlashcards] = (0, react_1.useState)(null);
    const [imageDataUri, setImageDataUri] = (0, react_1.useState)(null);
    const [audioDataUri, setAudioDataUri] = (0, react_1.useState)(null);
    const [isSynthesizing, setIsSynthesizing] = (0, react_1.useState)(null);
    const [activeTab, setActiveTab] = (0, react_1.useState)("analysis");
    const [isAnalyzing, startAnalyzing] = (0, react_1.useTransition)();
    const [isLoadingMaterial, startLoadingMaterial] = (0, react_1.useTransition)();
    const [isGeneratingFlashcards, startGeneratingFlashcards] = (0, react_1.useTransition)();
    const [isGeneratingQuiz, startGeneratingQuiz] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const fileInputRef = (0, react_1.useRef)(null);
    const imageInputRef = (0, react_1.useRef)(null);
    const router = (0, navigation_1.useRouter)();
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const recognitionRef = (0, react_1.useRef)(null);
    const [isCameraOpen, setIsCameraOpen] = (0, react_1.useState)(false);
    const [hasCameraPermission, setHasCameraPermission] = (0, react_1.useState)(null);
    const videoRef = (0, react_1.useRef)(null);
    const [isStreamReady, setIsStreamReady] = (0, react_1.useState)(false);
    const [videoDevices, setVideoDevices] = (0, react_1.useState)([]);
    const [currentDeviceId, setCurrentDeviceId] = (0, react_1.useState)(undefined);
    const streamRef = (0, react_1.useRef)(null);
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
    const handleAnalyze = (0, react_1.useCallback)(async () => {
        if (imageDataUri) {
            handleAnalyzeImage();
            return;
        }
        if (content.trim().length < 50) {
            toast({
                title: "Content too short",
                description: "Please provide at least 50 characters for a better analysis.",
                variant: "destructive",
            });
            return;
        }
        startAnalyzing(async () => {
            const result = await (0, actions_1.analyzeContentAction)(content);
            if (result.error) {
                toast({ title: "Analysis Failed", description: result.error, variant: "destructive" });
            }
            else if (result.data) {
                setAnalysis(result.data ?? null);
                setFlashcards(null);
                setActiveTab("analysis");
            }
        });
    }, [content, imageDataUri, toast]);
    const handleAnalyzeImage = (0, react_1.useCallback)(async () => {
        if (!imageDataUri)
            return;
        startAnalyzing(async () => {
            const result = await (0, actions_1.analyzeImageContentAction)({ imageDataUri: imageDataUri, prompt: content });
            if (result.error) {
                toast({ title: "Image Analysis Failed", description: result.error, variant: "destructive" });
            }
            else {
                setAnalysis(result.data);
                setFlashcards(null);
                setActiveTab("analysis");
            }
        });
    }, [imageDataUri, content, toast]);
    const handleGenerateFlashcards = (0, react_1.useCallback)(async () => {
        if (!analysis)
            return;
        startGeneratingFlashcards(async () => {
            const flashcardContent = `Key Concepts: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Questions: ${analysis.potentialQuestions?.join(' ')}`;
            const result = await (0, actions_1.generateFlashcardsAction)({ content: flashcardContent });
            if (result.error) {
                toast({ title: "Flashcard Generation Failed", description: result.error, variant: "destructive" });
            }
            else {
                setFlashcards(result.data?.flashcards ?? []);
                setActiveTab("flashcards");
            }
        });
    }, [analysis, toast]);
    const handleGenerateQuiz = async () => {
        if (!analysis)
            return;
        try {
            const quizContent = `Key Concepts: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Questions: ${analysis.potentialQuestions?.join(' ')}`;
            localStorage.setItem('quizContent', quizContent);
            router.push('/quiz/options');
        }
        catch (e) {
            toast({
                title: "Could not start quiz",
                description: "There was an error while preparing the quiz content.",
                variant: "destructive",
            });
        }
    };
    const handleFileUploadClick = () => fileInputRef.current?.click();
    const handleImageUploadClick = () => imageInputRef.current?.click();
    const handleTextToSpeech = async (text, id) => {
        if (isSynthesizing === id) {
            setAudioDataUri(null);
            setIsSynthesizing(null);
            return;
        }
        setIsSynthesizing(id);
        setAudioDataUri(null);
        try {
            const result = await (0, actions_1.textToSpeechAction)({ text });
            if (result.error) {
                toast({ title: 'Audio Generation Failed', description: result.error, variant: 'destructive' });
                setIsSynthesizing(null);
            }
            else if (result.data) {
                setAudioDataUri(result.data.audioDataUri);
            }
        }
        catch (e) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
            setIsSynthesizing(null);
        }
    };
    const handleCopyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${type} Copied!`, description: `The ${type.toLowerCase()} has been copied to your clipboard.` });
    };
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === "text/plain") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result;
                    setContent(text);
                    setTitle(file.name.replace('.txt', ''));
                    setAnalysis(null);
                    setFlashcards(null);
                    setImageDataUri(null);
                    toast({ title: "File loaded", description: "The file content has been loaded. Click Analyze to begin." });
                };
                reader.readAsText(file);
            }
            else {
                toast({ title: "Invalid file type", description: "Please upload a .txt file.", variant: "destructive" });
            }
        }
    };
    const handleImageFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                startLoadingMaterial(async () => {
                    try {
                        const dataUri = await (0, image_to_data_uri_1.default)(URL.createObjectURL(file));
                        setImageDataUri(dataUri);
                        const ocrResult = await (0, actions_1.imageToTextAction)({ imageDataUri: dataUri });
                        if (ocrResult.error) {
                            throw new Error(ocrResult.error);
                        }
                        setContent(ocrResult.data?.text || "");
                        setTitle(file.name);
                        setAnalysis(null);
                        setFlashcards(null);
                        toast({ title: "Image & Text Loaded!", description: "Text has been extracted via OCR. Click Analyze to begin." });
                    }
                    catch (error) {
                        toast({ title: "Image processing failed", description: error.message || "Could not read the image file or extract text.", variant: "destructive" });
                        setImageDataUri(null);
                    }
                });
            }
            else {
                toast({ title: "Invalid file type", description: "Please upload an image file (e.g., PNG, JPG).", variant: "destructive" });
            }
        }
    };
    const clearImage = () => {
        setImageDataUri(null);
        setTitle("");
        setContent("");
        setAnalysis(null);
        setFlashcards(null);
        if (imageInputRef.current)
            imageInputRef.current.value = "";
    };
    const handleTutorChat = async (history) => await (0, actions_1.chatWithTutorAction)({ content, history });
    const startCamera = (0, react_1.useCallback)(async (deviceId) => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsStreamReady(false);
        const videoConstraints = {
            facingMode: { ideal: "environment" }
        };
        if (deviceId) {
            videoConstraints.deviceId = { exact: deviceId };
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
            streamRef.current = stream;
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setIsStreamReady(true);
            }
        }
        catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        const getDevicesAndStart = async () => {
            if (isCameraOpen) {
                try {
                    setHasCameraPermission(null);
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevs = devices.filter(d => d.kind === 'videoinput');
                    setVideoDevices(videoDevs);
                    let initialDeviceId = currentDeviceId;
                    if (!initialDeviceId && videoDevs.length > 0) {
                        const backCamera = videoDevs.find(d => d.label.toLowerCase().includes('back'));
                        initialDeviceId = backCamera ? backCamera.deviceId : videoDevs[0].deviceId;
                        setCurrentDeviceId(initialDeviceId);
                    }
                    await startCamera(initialDeviceId);
                }
                catch (e) {
                    console.error("Failed to enumerate devices:", e);
                    setHasCameraPermission(false);
                }
            }
        };
        getDevicesAndStart();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [isCameraOpen, currentDeviceId, startCamera]);
    const handleSwitchCamera = () => {
        if (videoDevices.length > 1) {
            const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            setCurrentDeviceId(videoDevices[nextIndex].deviceId);
        }
    };
    const handleCaptureImage = () => {
        if (!videoRef.current)
            return;
        startLoadingMaterial(async () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (!context) {
                toast({ title: "Capture failed", description: "Could not get canvas context.", variant: "destructive" });
                return;
            }
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/png');
            setIsCameraOpen(false);
            setImageDataUri(dataUri);
            try {
                const ocrResult = await (0, actions_1.imageToTextAction)({ imageDataUri: dataUri });
                if (ocrResult.error)
                    throw new Error(ocrResult.error);
                setContent(ocrResult.data?.text || "");
                setTitle("Camera Capture");
                setAnalysis(null);
                setFlashcards(null);
                toast({ title: "Image Captured & Text Extracted!", description: "The captured image is ready for analysis." });
            }
            catch (error) {
                toast({ title: "OCR Failed", description: error.message || "Could not extract text from the captured image.", variant: "destructive" });
                // Keep image but content will be empty
                setContent("");
            }
        });
    };
    const isLoading = isAnalyzing || isLoadingMaterial || isGeneratingFlashcards || isGeneratingQuiz;
    const TABS = [
        { value: "analysis", label: "Analysis", disabled: !analysis },
        { value: "flashcards", label: "Flashcards", disabled: !analysis },
        { value: "quiz", label: "Quiz", disabled: !analysis },
        { value: "tutor", label: "Tutor", disabled: !analysis }
    ];
    const analysisAsImageOutput = analysis;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-screen flex-col bg-muted/40", children: [(0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isCameraOpen, onOpenChange: setIsCameraOpen, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Capture from Camera" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("video", { ref: videoRef, className: "w-full aspect-video rounded-md bg-muted", autoPlay: true, muted: true }), hasCameraPermission === null &&
                                    (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center justify-center bg-background/80", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "animate-spin h-8 w-8 mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-muted-foreground", children: "Requesting camera access..." })] }) }), hasCameraPermission === false && ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center justify-center bg-background/80 p-4", children: (0, jsx_runtime_1.jsxs)(alert_1.Alert, { variant: "destructive", children: [(0, jsx_runtime_1.jsx)(alert_1.AlertTitle, { children: "Camera Access Required" }), (0, jsx_runtime_1.jsx)(alert_1.AlertDescription, { children: "Please allow camera access in your browser settings to use this feature. You may need to reload the page after granting permission." })] }) }))] }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogFooter, { className: "flex justify-between w-full", children: [(0, jsx_runtime_1.jsx)("div", { children: videoDevices.length > 1 && ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handleSwitchCamera, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CameraRotate, { className: "mr-2 h-4 w-4" }), " Switch Camera"] })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogClose, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", children: "Cancel" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleCaptureImage, disabled: !hasCameraPermission || !isStreamReady || isLoadingMaterial, children: isLoadingMaterial ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : isStreamReady ? 'Capture & OCR' : 'Starting...' })] })] })] }) }), (0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Study Session" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-4xl space-y-8", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex flex-col @container", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Your Study Material" }), (0, jsx_runtime_1.jsxs)(card_1.CardDescription, { children: ["Paste text, upload a document, or capture an image. Analysis is done by ", imageDataUri ? 'Gemini' : 'Qwen', "."] })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "flex-1 flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Enter a title for your material...", value: title, onChange: (e) => setTitle(e.target.value), className: "text-lg font-semibold", disabled: isLoading }), isLoadingMaterial ? (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "w-full h-full min-h-[300px] flex-1" }) : imageDataUri ? ((0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1 min-h-[300px]", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: imageDataUri, alt: "Uploaded content", layout: "fill", objectFit: "contain", className: "rounded-md border" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "destructive", size: "icon", className: "absolute top-2 right-2 z-10 h-8 w-8", onClick: clearImage, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "relative h-full", children: [(0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "Paste your study content here... (min. 50 characters)", className: "h-full min-h-[300px] resize-none pr-10", value: content, onChange: (e) => setContent(e.target.value) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "icon", variant: isRecording ? 'destructive' : 'ghost', onClick: handleToggleRecording, className: "absolute bottom-3 right-3", children: [isRecording ? (0, jsx_runtime_1.jsx)(lucide_react_1.MicOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Mic, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: isRecording ? 'Stop recording' : 'Start recording' })] })] })), imageDataUri && (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "Text extracted via OCR will appear here. You can edit it before analysis.", className: "h-24 resize-none", value: content, onChange: (e) => setContent(e.target.value) })] }), (0, jsx_runtime_1.jsxs)(card_1.CardFooter, { className: "flex flex-col items-stretch gap-2 @sm:flex-row", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleAnalyze, disabled: isLoading || (!imageDataUri && content.trim().length < 50), children: [isAnalyzing ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Analyze"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-stretch gap-2 flex-1", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex-1", onClick: handleFileUploadClick, disabled: isLoading, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileUp, { className: "mr-2 h-4 w-4" }), ".txt"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex-1", onClick: handleImageUploadClick, disabled: isLoading, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Image, { className: "mr-2 h-4 w-4" }), "Image"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex-1", onClick: () => { setIsCameraOpen(true); }, disabled: isLoading, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "mr-2 h-4 w-4" }), "Capture"] })] }), (0, jsx_runtime_1.jsx)("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, className: "hidden", accept: ".txt" }), (0, jsx_runtime_1.jsx)("input", { type: "file", ref: imageInputRef, onChange: handleImageFileChange, className: "hidden", accept: "image/*" })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex flex-col @container min-h-[400px]", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "AI-Powered Study Tools" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Tools are powered by their optimal AI models." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "flex-1", children: isAnalyzing && !analysis ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 p-1", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-8 w-1/3" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-20 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-8 w-1/3" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-20 w-full" })] })) : !analysis ? ((0, jsx_runtime_1.jsx)("div", { className: "flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mx-auto h-12 w-12 text-muted-foreground" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-4 text-lg font-semibold", children: "Ready to Learn?" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-muted-foreground", children: "Analyze your material to generate study tools." })] }) })) : ((0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsList, { className: "grid w-full grid-cols-2 sm:grid-cols-4", children: TABS.map(tab => (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: tab.value, disabled: tab.disabled, children: tab.label }, tab.value)) }), (0, jsx_runtime_1.jsxs)(scroll_area_1.ScrollArea, { className: "mt-4 flex-1", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "analysis", className: "h-full", children: (0, jsx_runtime_1.jsxs)(accordion_1.Accordion, { type: "multiple", defaultValue: ['summary', 'key-concepts'], className: "w-full space-y-3 pr-4", children: [(0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "summary", className: "rounded-md border bg-card px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline text-base", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pilcrow, {}), "Summary"] }) }), (0, jsx_runtime_1.jsxs)(accordion_1.AccordionContent, { className: "prose prose-sm dark:prose-invert max-w-none text-muted-foreground", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-end", children: (0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", variant: "ghost", onClick: () => handleTextToSpeech(analysis.summary, 'summary'), disabled: !!isSynthesizing, className: "mb-2", children: isSynthesizing === 'summary' ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Volume2, {}) }) }), audioDataUri && isSynthesizing === 'summary' && ((0, jsx_runtime_1.jsx)("div", { className: "mb-2", children: (0, jsx_runtime_1.jsx)("audio", { controls: true, autoPlay: true, src: audioDataUri, className: "w-full", onEnded: () => { setAudioDataUri(null); setIsSynthesizing(null); } }) })), (0, jsx_runtime_1.jsx)("p", { children: analysis.summary })] })] }), (0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "key-concepts", className: "rounded-md border bg-card px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline text-base", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BrainCircuit, {}), "Key Concepts"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "prose prose-sm dark:prose-invert max-w-none", children: analysis.keyConcepts?.map((concept, i) => (0, jsx_runtime_1.jsxs)("div", { className: "py-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-semibold !my-0", children: concept.concept }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground !my-0", children: concept.explanation })] }, i)) })] }), 'entities' in analysis && ((0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "entities", className: "rounded-md border bg-card px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline text-base", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ListTree, {}), "Entities"] }) }), (0, jsx_runtime_1.jsxs)(accordion_1.AccordionContent, { className: "space-y-3", children: [analysisAsImageOutput.entities.people.length > 0 && (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h4", { className: "flex items-center gap-2 text-sm font-semibold mb-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "size-4" }), "People"] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: analysisAsImageOutput.entities.people.map(p => (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full", children: p }, p)) })] }), analysisAsImageOutput.entities.places.length > 0 && (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h4", { className: "flex items-center gap-2 text-sm font-semibold mb-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "size-4" }), "Places"] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: analysisAsImageOutput.entities.places.map(p => (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full", children: p }, p)) })] }), analysisAsImageOutput.entities.dates.length > 0 && (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h4", { className: "flex items-center gap-2 text-sm font-semibold mb-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "size-4" }), "Dates"] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: analysisAsImageOutput.entities.dates.map(d => (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full", children: d }, d)) })] })] })] })), 'diagrams' in analysis && analysisAsImageOutput.diagrams.length > 0 && ((0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "diagrams", className: "rounded-md border bg-card px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline text-base", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ListTree, {}), "Diagrams & Processes"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "space-y-4", children: analysisAsImageOutput.diagrams.map((d, i) => (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold", children: d.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: d.explanation })] }, i)) })] })), analysis.codeExamples?.length > 0 && ((0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "code-examples", className: "rounded-md border bg-card px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline text-base", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Code, {}), "Code Examples"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "space-y-4", children: analysis.codeExamples.map((example, i) => (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: example.explanation }), (0, jsx_runtime_1.jsxs)("div", { className: "relative rounded-md bg-muted/50 p-4 font-mono text-xs", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", variant: "ghost", className: "absolute top-2 right-2 h-6 w-6", onClick: () => handleCopyToClipboard(example.code, "Code"), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)("pre", { className: "whitespace-pre-wrap", children: (0, jsx_runtime_1.jsx)("code", { children: example.code }) })] })] }, i)) })] })), (0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "potential-questions", className: "rounded-md border bg-card px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline text-base", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, {}), "Potential Questions"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "prose-sm dark:prose-invert max-w-none", children: (0, jsx_runtime_1.jsx)("ul", { className: "mt-2 list-disc space-y-2 pl-5 text-muted-foreground", children: analysis.potentialQuestions?.map((q, i) => (0, jsx_runtime_1.jsx)("li", { children: q }, i)) }) })] }), (0, jsx_runtime_1.jsxs)(accordion_1.AccordionItem, { value: "related-topics", className: "rounded-md border bg-card px-4", children: [(0, jsx_runtime_1.jsx)(accordion_1.AccordionTrigger, { className: "py-4 text-left font-medium hover:no-underline text-base", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ListTree, {}), "Related Topics"] }) }), (0, jsx_runtime_1.jsx)(accordion_1.AccordionContent, { className: "prose-sm dark:prose-invert max-w-none", children: (0, jsx_runtime_1.jsx)("ul", { className: "mt-2 list-disc space-y-2 pl-5 text-muted-foreground", children: analysis.relatedTopics?.map((q, i) => (0, jsx_runtime_1.jsx)("li", { children: q }, i)) }) })] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "flashcards", className: "h-full", children: isGeneratingFlashcards ? (0, jsx_runtime_1.jsxs)("div", { className: "flex h-full items-center justify-center gap-2 text-muted-foreground", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "animate-spin" }), " ", (0, jsx_runtime_1.jsx)("p", { children: "Generating flashcards..." })] }) : flashcards ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 gap-4 pr-4 @md:grid-cols-2", children: flashcards.map((card, i) => (0, jsx_runtime_1.jsx)(flashcard_1.Flashcard, { ...card }, i)) })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex h-full items-center justify-center", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerateFlashcards, disabled: isGeneratingFlashcards, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BookCopy, { className: "mr-2 h-4 w-4" }), "Generate Flashcards"] }) })) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "quiz", className: "h-full", children: isGeneratingQuiz ? (0, jsx_runtime_1.jsxs)("div", { className: "flex h-full items-center justify-center gap-2 text-muted-foreground", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "animate-spin" }), " ", (0, jsx_runtime_1.jsx)("p", { children: "Generating quiz..." })] }) : ((0, jsx_runtime_1.jsx)("div", { className: "flex h-full items-center justify-center", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerateQuiz, disabled: isGeneratingQuiz, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, { className: "mr-2 h-4 w-4" }), "Generate Quiz & Start"] }) })) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "tutor", className: "h-full", children: (0, jsx_runtime_1.jsx)(tutor_chat_1.TutorChat, { content: analysis ? (imageDataUri ? `Image name: ${title}. Key Concepts from Image: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Potential Questions from Image: ${analysis.potentialQuestions?.join(' ')}` : content) : content, onSendMessage: handleTutorChat }) })] })] })) })] })] }) })] }));
}
