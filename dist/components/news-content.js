"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsContent = NewsContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const skeleton_1 = require("./ui/skeleton");
const tabs_1 = require("./ui/tabs");
const framer_motion_1 = require("framer-motion");
const image_1 = __importDefault(require("next/image"));
const categories = [
    { name: "Top Headlines", value: "top" },
    { name: "Technology", value: "technology" },
    { name: "Artificial Intelligence", value: "ai" },
    { name: "Gaming", value: "gaming" },
];
const loadingSteps = [
    "Fetching top headlines...",
    "Analyzing the latest sources...",
    "Compiling your news feed...",
    "Almost there, just a moment...",
];
function NewsContent() {
    const [articles, setArticles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [loadingStep, setLoadingStep] = (0, react_1.useState)(0);
    const [error, setError] = (0, react_1.useState)(null);
    const [activeCategory, setActiveCategory] = (0, react_1.useState)("top");
    const [page, setPage] = (0, react_1.useState)(1);
    const [hasMore, setHasMore] = (0, react_1.useState)(true);
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        let stepInterval;
        if (loading && page === 1) {
            setLoadingStep(0);
            stepInterval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % loadingSteps.length);
            }, 2000); // Change message every 2 seconds
        }
        return () => clearInterval(stepInterval);
    }, [loading, page]);
    const fetchNews = (0, react_1.useCallback)(async (category, pageNum) => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/news?page=${pageNum}&`;
            const searchCategory = category === 'top' ? 'general' : category;
            url += category === 'ai' ? `q=artificial%20intelligence` : `category=${searchCategory}`;
            const res = await fetch(url);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to fetch news");
            }
            const data = await res.json();
            const newArticles = (data.articles || []).filter((article) => article.title && article.title !== "[Removed]");
            setArticles(prev => pageNum === 1 ? newArticles : [...prev, ...newArticles]);
            setHasMore(newArticles.length > 0 && newArticles.length === 40);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        setArticles([]);
        setPage(1);
        setHasMore(true);
        fetchNews(activeCategory, 1);
    }, [activeCategory, fetchNews]);
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(activeCategory, nextPage);
    };
    const handleReadMore = (article) => {
        try {
            localStorage.setItem('selectedArticle', JSON.stringify(article));
            router.push('/news-reader');
        }
        catch (e) {
            console.error("Could not save article to localStorage", e);
            setError("Could not open article. Please try again.");
        }
    };
    const handleRefresh = () => {
        setArticles([]);
        setPage(1);
        setHasMore(true);
        fetchNews(activeCategory, 1);
    };
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: [(0, jsx_runtime_1.jsxs)("header", { className: "mb-8 text-center relative", children: [(0, jsx_runtime_1.jsx)("div", { className: "mt-2 text-lg text-muted-foreground h-7", children: (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { mode: "wait", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.p, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, transition: { duration: 0.3 }, children: loading && page === 1 ? loadingSteps[loadingStep] : "Top headlines in technology and education." }, loading && page === 1 ? loadingStep : 'default') }) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: handleRefresh, disabled: loading, className: "absolute right-0 top-1/2 -translate-y-1/2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: `mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}` }), "Refresh"] })] }), (0, jsx_runtime_1.jsx)(tabs_1.Tabs, { value: activeCategory, onValueChange: setActiveCategory, className: "w-full mb-6", children: (0, jsx_runtime_1.jsx)(tabs_1.TabsList, { className: "grid w-full grid-cols-2 md:grid-cols-4", children: categories.map(cat => ((0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: cat.value, children: cat.name }, cat.value))) }) }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-destructive font-semibold", children: "Failed to load news" }), (0, jsx_runtime_1.jsx)("p", { className: "text-destructive/80 text-sm mt-1", children: error }), (0, jsx_runtime_1.jsx)("p", { className: "text-destructive/80 text-sm mt-4", children: "Please make sure your NewsAPI key is set in the .env file." })] })), loading && page === 1 ? ((0, jsx_runtime_1.jsx)("div", { className: "grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 9 }).map((_, i) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: "p-0", children: (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-48 w-full" }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4 space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-3/4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-5/6" })] })] }, i))) })) : !error && articles.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-muted-foreground mt-12", children: (0, jsx_runtime_1.jsx)("p", { children: "No new articles found for this category. Please check back later!" }) })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", children: articles.map((article, i) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: "p-0", children: (0, jsx_runtime_1.jsx)("div", { className: "relative w-full h-48 bg-muted", children: article.urlToImage ? ((0, jsx_runtime_1.jsx)(image_1.default, { src: article.urlToImage, alt: article.title, fill: true, className: "object-cover", unoptimized // Using this because many news sources don't allow image optimization
                                                : true, onError: (e) => { e.currentTarget.style.display = 'none'; } })) : null }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4 flex-grow flex flex-col", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-lg leading-snug flex-grow", children: article.title }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground mt-1", children: [new Date(article.publishedAt).toLocaleDateString(), " \u00B7 ", article.source.name] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "mt-2 text-sm line-clamp-3", children: article.description })] }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { className: "p-4 pt-0", children: (0, jsx_runtime_1.jsx)(button_1.Button, { className: "w-full", onClick: () => handleReadMore(article), children: "Read More" }) })] }, `${article.url}-${i}`))) }), hasMore && !loading && ((0, jsx_runtime_1.jsx)("div", { className: "text-center mt-8", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleLoadMore, disabled: loading, children: [loading && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Load More"] }) }))] }))] }) }));
}
