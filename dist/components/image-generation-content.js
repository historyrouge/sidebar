"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateImageOutputSchema = exports.GenerateImageInputSchema = void 0;
exports.ImageGenerationContent = ImageGenerationContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const actions_1 = require("@/app/actions");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const image_1 = __importDefault(require("next/image"));
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
const alert_1 = require("./ui/alert");
const zod_1 = require("zod");
exports.GenerateImageInputSchema = zod_1.z.object({
    prompt: zod_1.z.string().describe('A text description of the image to generate.'),
});
exports.GenerateImageOutputSchema = zod_1.z.object({
    imageDataUri: zod_1.z
        .string()
        .describe("The generated image as a data URI."),
});
function ImageGenerationContent() {
    const [prompt, setPrompt] = (0, react_1.useState)("");
    const [generatedImage, setGeneratedImage] = (0, react_1.useState)(null);
    const [isGenerating, startGenerating] = (0, react_1.useTransition)();
    const [error, setError] = (0, react_1.useState)(null);
    const { toast } = (0, use_toast_1.useToast)();
    const handleGenerateImage = () => {
        if (!prompt.trim()) {
            toast({ title: "Prompt is empty", description: "Please enter a description for the image.", variant: "destructive" });
            return;
        }
        startGenerating(async () => {
            setGeneratedImage(null);
            setError(null);
            const result = await (0, actions_1.generateImageAction)({ prompt });
            if (result.error) {
                setError(result.error);
                toast({ title: "Image Generation Failed", description: result.error, variant: "destructive" });
            }
            else if (result.data) {
                setGeneratedImage(result.data.imageDataUri);
                toast({ title: "Image Generated Successfully!" });
            }
        });
    };
    const handleDownload = () => {
        if (!generatedImage)
            return;
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `${prompt.substring(0, 30).replace(/\s/g, "_")}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Image downloaded" });
    };
    const handleShare = () => {
        if (!generatedImage)
            return;
        // Simple copy for now, as sharing data URI directly can be tricky
        navigator.clipboard.writeText(generatedImage);
        toast({ title: "Image Data URL Copied!", description: "You can paste this into a browser or another app." });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [(0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "AI Image Generation" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Describe Your Image" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Enter a detailed prompt to generate an SVG image using an AI model." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { placeholder: "e.g., A simple logo for a coffee shop", className: "h-40", value: prompt, onChange: (e) => setPrompt(e.target.value) }) }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerateImage, disabled: isGenerating, children: [isGenerating ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Generate Image"] }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Generated Image" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "aspect-square w-full rounded-lg border-2 border-dashed border-muted bg-muted/50 flex items-center justify-center p-4", children: isGenerating ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }), (0, jsx_runtime_1.jsx)("p", { children: "Generating..." })] })) : error ? ((0, jsx_runtime_1.jsxs)(alert_1.Alert, { variant: "destructive", className: "m-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)(alert_1.AlertTitle, { children: "Generation Failed" }), (0, jsx_runtime_1.jsx)(alert_1.AlertDescription, { children: error })] })) : generatedImage ? ((0, jsx_runtime_1.jsx)(image_1.default, { src: generatedImage, alt: prompt, width: 512, height: 512, className: "object-contain rounded-md" })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-muted-foreground p-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Image, { className: "mx-auto h-12 w-12" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2", children: "Your image will appear here." })] })) }) }), generatedImage && !isGenerating && ((0, jsx_runtime_1.jsxs)(card_1.CardFooter, { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { className: "w-full", onClick: handleDownload, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }), "Download SVG"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { className: "w-full", variant: "outline", onClick: handleShare, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { className: "mr-2 h-4 w-4" }), "Share"] })] }))] })] }) })] }));
}
