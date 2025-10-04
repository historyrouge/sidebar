"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationMakerContent = PresentationMakerContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const sidebar_1 = require("./ui/sidebar");
const back_button_1 = require("./back-button");
const actions_1 = require("@/app/actions");
const alert_1 = require("./ui/alert");
const carousel_1 = require("@/components/ui/carousel");
const react_2 = __importDefault(require("react"));
const select_1 = require("./ui/select");
const radio_group_1 = require("./ui/radio-group");
const SlideIcon = ({ type }) => {
    switch (type) {
        case 'title': return (0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "w-8 h-8" });
        case 'overview': return (0, jsx_runtime_1.jsx)(lucide_react_1.ListOrdered, { className: "w-8 h-8" });
        case 'content': return (0, jsx_runtime_1.jsx)(lucide_react_1.Milestone, { className: "w-8 h-8" });
        case 'summary': return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-8 h-8" });
        case 'closing': return (0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "w-8 h-8" });
        default: return (0, jsx_runtime_1.jsx)(lucide_react_1.Presentation, { className: "w-8 h-8" });
    }
};
function PresentationMakerContent() {
    const [topic, setTopic] = (0, react_1.useState)("");
    const [numSlides, setNumSlides] = (0, react_1.useState)("7");
    const [style, setStyle] = (0, react_1.useState)("colorful");
    const [colors, setColors] = (0, react_1.useState)("");
    const [presentation, setPresentation] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [isGenerating, startGenerating] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const [api, setApi] = react_2.default.useState();
    const [current, setCurrent] = react_2.default.useState(0);
    const [count, setCount] = react_2.default.useState(0);
    react_2.default.useEffect(() => {
        if (!api)
            return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
    }, [api]);
    const handleGenerate = () => {
        if (!topic) {
            toast({
                title: "Missing Topic",
                description: "Please enter a topic to generate a presentation.",
                variant: "destructive",
            });
            return;
        }
        setError(null);
        setPresentation(null);
        startGenerating(async () => {
            const result = await (0, actions_1.generatePresentationAction)({ topic, numSlides: parseInt(numSlides), style, colors });
            if (result.error) {
                setError(result.error);
                toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
            }
            else if (result.data) {
                setPresentation(result.data);
                toast({ title: "Presentation Generated!", description: "Your presentation is ready to view." });
            }
        });
    };
    const handleDownload = () => {
        if (!presentation)
            return;
        const content = `# ${presentation.title}\n\n` + presentation.slides.map(slide => {
            return `---
## ${slide.title} (${slide.slideType})

${slide.content.map(point => `- ${point}`).join('\n')}

### Speaker Notes:
${slide.speakerNotes}
`;
        }).join('\n\n');
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/\s+/g, '_')}_presentation.md`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "AI Presentation Maker" })] }), presentation && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", onClick: () => setPresentation(null), children: "New Presentation" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handleDownload, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }), "Download MD"] })] }))] }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: isGenerating ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-primary" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-4 text-lg font-semibold", children: "Generating your presentation..." }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "The AI is crafting your slides. Please wait a moment." })] })) : !presentation ? ((0, jsx_runtime_1.jsx)("div", { className: "mx-auto max-w-xl", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Create a New Presentation" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Enter a topic and customize the options, and our AI will generate a slide deck for you." })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "topic", children: "1. Presentation Topic" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "topic", placeholder: "e.g., The Future of Renewable Energy", value: topic, onChange: e => setTopic(e.target.value) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "num-slides", children: "2. Number of Slides" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: numSlides, onValueChange: setNumSlides, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { id: "num-slides", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "5", children: "5 Slides" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "7", children: "7 Slides" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "10", children: "10 Slides" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "3. Style Preference" }), (0, jsx_runtime_1.jsxs)(radio_group_1.RadioGroup, { value: style, onValueChange: setStyle, className: "flex gap-4 pt-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: "colorful", id: "colorful" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "colorful", children: "Colorful" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: "simple", id: "simple" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "simple", children: "Simple" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "colors", children: "4. Preferred Colors (Optional)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "colors", placeholder: "e.g., blue and yellow", value: colors, onChange: e => setColors(e.target.value) })] }), error && ((0, jsx_runtime_1.jsxs)(alert_1.Alert, { variant: "destructive", className: "mt-4", children: [(0, jsx_runtime_1.jsx)(alert_1.AlertTitle, { children: "Generation Failed" }), (0, jsx_runtime_1.jsx)(alert_1.AlertDescription, { children: error })] }))] }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleGenerate, disabled: isGenerating, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "mr-2 h-4 w-4" }), "Generate Presentation"] }) })] }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-5xl", style: {
                        '--slide-bg': presentation.colorTheme.background,
                        '--slide-text': presentation.colorTheme.primary,
                        '--slide-accent': presentation.colorTheme.accent,
                    }, children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl font-bold text-center mb-2", children: presentation.title }), (0, jsx_runtime_1.jsxs)("p", { className: "text-center text-muted-foreground mb-8", children: ["A presentation on \"", topic, "\" generated by Easy Learn AI"] }), (0, jsx_runtime_1.jsxs)(carousel_1.Carousel, { setApi: setApi, className: "w-full", children: [(0, jsx_runtime_1.jsx)(carousel_1.CarouselContent, { children: presentation.slides.map((slide, index) => ((0, jsx_runtime_1.jsx)(carousel_1.CarouselItem, { children: (0, jsx_runtime_1.jsx)(card_1.Card, { className: "min-h-[60vh] flex flex-col shadow-lg overflow-hidden border-2", style: { backgroundColor: 'var(--slide-bg)', borderColor: 'var(--slide-accent)' }, children: slide.slideType === 'title' || slide.slideType === 'closing' ? ((0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "flex flex-col flex-1 items-center justify-center text-center p-6", style: { color: 'var(--slide-text)' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 rounded-full mb-6", style: { backgroundColor: 'var(--slide-accent)' }, children: (0, jsx_runtime_1.jsx)(SlideIcon, { type: slide.slideType }) }), (0, jsx_runtime_1.jsx)("h2", { className: "text-4xl font-bold", children: slide.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xl mt-2 max-w-xl", style: { color: 'var(--slide-accent)' }, children: slide.content[0] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { style: { color: 'var(--slide-text)' }, children: [index + 1, ". ", slide.title] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-6 flex-1 grid md:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "md:col-span-2 prose prose-lg max-w-none", style: { '--tw-prose-body': 'var(--slide-text)', '--tw-prose-bullets': 'var(--slide-accent)' }, children: (0, jsx_runtime_1.jsx)("ul", { children: slide.content.map((point, i) => (0, jsx_runtime_1.jsx)("li", { children: point }, i)) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "md:col-span-1 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-background/20 p-4 rounded-lg backdrop-blur-sm", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", style: { color: 'var(--slide-accent)' }, children: "Speaker Notes" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm italic", style: { color: 'var(--slide-text)' }, children: slide.speakerNotes })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-background/20 p-4 rounded-lg backdrop-blur-sm", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "font-semibold mb-2 flex items-center gap-2", style: { color: 'var(--slide-accent)' }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lightbulb, {}), "Visual Suggestion"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", style: { color: 'var(--slide-text)' }, children: slide.visualSuggestion })] })] })] })] })) }) }, index))) }), (0, jsx_runtime_1.jsx)(carousel_1.CarouselPrevious, { className: "hidden md:flex" }), (0, jsx_runtime_1.jsx)(carousel_1.CarouselNext, { className: "hidden md:flex" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "py-2 text-center text-sm text-muted-foreground", children: ["Slide ", current, " of ", count] })] })) })] }));
}
