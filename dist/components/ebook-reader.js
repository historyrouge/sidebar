"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EbookReader = EbookReader;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("./ui/button");
const sidebar_1 = require("./ui/sidebar");
const utils_1 = require("@/lib/utils");
const link_1 = __importDefault(require("next/link"));
const back_button_1 = require("./back-button");
const use_toast_1 = require("@/hooks/use-toast");
const skeleton_1 = require("./ui/skeleton");
const actions_1 = require("@/app/actions");
const ebooks = [
    {
        title: "The Art of Programming",
        description: "An essential guide to the fundamentals of computer programming and software design, covering algorithms, data structures, and more.",
        coverUrl: "https://placehold.co/300x400.png",
    },
    {
        title: "A Journey Through the Cosmos",
        description: "Explore the wonders of the universe, from the Big Bang to the most distant galaxies. A captivating read for astronomy enthusiasts.",
        coverUrl: "https://placehold.co/300x400.png",
    },
    {
        title: "The History of Ancient Civilizations",
        description: "A comprehensive look at the rise and fall of the world's most influential ancient societies, from Mesopotamia to Rome.",
        coverUrl: "https://placehold.co/300x400.png",
    },
];
function EbookReader({ slug }) {
    const [bookTitle, setBookTitle] = (0, react_1.useState)("");
    const [chapters, setChapters] = (0, react_1.useState)({});
    const [currentChapter, setCurrentChapter] = (0, react_1.useState)(1);
    const [isLoading, startLoading] = (0, react_1.useTransition)();
    const [isPrefetching, startPrefetching] = (0, react_1.useTransition)();
    const { toast } = (0, use_toast_1.useToast)();
    const fetchChapter = (0, react_1.useCallback)(async (chapterNumber) => {
        if (!bookTitle)
            return;
        const action = chapterNumber > currentChapter || Object.keys(chapters).length === 0 ? startLoading : startPrefetching;
        action(async () => {
            try {
                const result = await (0, actions_1.generateEbookChapterAction)({ title: bookTitle, chapter: chapterNumber });
                if (result.error) {
                    throw new Error(result.error);
                }
                else if (result.data?.content) {
                    setChapters(prev => ({ ...prev, [chapterNumber]: result.data.content }));
                }
                else {
                    throw new Error("Invalid format from AI.");
                }
            }
            catch (e) {
                toast({
                    title: `Failed to load Chapter ${chapterNumber}`,
                    description: e.message || "An error occurred with the AI model.",
                    variant: "destructive"
                });
            }
        });
    }, [bookTitle, currentChapter, chapters, toast]);
    (0, react_1.useEffect)(() => {
        const foundBook = ebooks.find(b => (0, utils_1.slugify)(b.title) === slug);
        if (foundBook) {
            setBookTitle(foundBook.title);
        }
    }, [slug]);
    (0, react_1.useEffect)(() => {
        if (bookTitle && !chapters[1]) {
            fetchChapter(1);
        }
    }, [bookTitle, chapters, fetchChapter]);
    // Prefetch next chapter
    (0, react_1.useEffect)(() => {
        if (bookTitle && chapters[currentChapter] && !chapters[currentChapter + 1]) {
            fetchChapter(currentChapter + 1);
        }
    }, [bookTitle, chapters, currentChapter, fetchChapter]);
    const handleNextChapter = () => {
        setCurrentChapter(prev => prev + 1);
    };
    const handlePrevChapter = () => {
        if (currentChapter > 1) {
            setCurrentChapter(prev => prev - 1);
        }
    };
    const renderContent = () => {
        const content = chapters[currentChapter];
        if (isLoading && !content) {
            return ((0, jsx_runtime_1.jsxs)("div", { className: "prose dark:prose-invert max-w-3xl mx-auto space-y-4", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-10 w-3/4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-5/6" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-full mt-4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-3/4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-full mt-4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-2/3" })] }));
        }
        if (!content) {
            return ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 flex items-center justify-center text-center", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold", children: "Chapter not found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "Could not load content for this chapter." })] }) }));
        }
        return content.map((item, index) => {
            switch (item.type) {
                case 'h1': return (0, jsx_runtime_1.jsx)("h1", { className: "text-4xl font-bold mt-8 mb-4 !pb-2 !border-b-2", children: item.text }, index);
                case 'h2': return (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold mt-6 mb-3 !pb-1 !border-b", children: item.text }, index);
                case 'p': return (0, jsx_runtime_1.jsx)("p", { className: "text-lg leading-relaxed", children: item.text }, index);
                default: return (0, jsx_runtime_1.jsx)("p", { children: item.text }, index);
            }
        });
    };
    if (!bookTitle) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 flex items-center justify-center text-center", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold", children: "Book not found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "The requested eBook could not be found." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/ebooks", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "link", className: "mt-4", children: "Back to Library" }) })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-1 flex-col", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: [(0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 mx-4 truncate", children: (0, jsx_runtime_1.jsx)("h1", { className: "text-lg font-semibold truncate", children: bookTitle }) }), (0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, {})] }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsx)("div", { className: "prose dark:prose-invert max-w-3xl mx-auto", children: renderContent() }) }), (0, jsx_runtime_1.jsxs)("footer", { className: "sticky bottom-0 flex h-14 items-center justify-between border-t bg-background px-4 md:px-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handlePrevChapter, disabled: currentChapter === 1 || isLoading, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }), "Previous Chapter"] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-muted-foreground", children: ["Chapter ", currentChapter] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handleNextChapter, disabled: isLoading && !chapters[currentChapter + 1], children: [(isLoading && !chapters[currentChapter + 1]) || (isPrefetching && !chapters[currentChapter + 1]) ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }), "Next Chapter"] })] })] }));
}
