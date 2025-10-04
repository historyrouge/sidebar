"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EbooksContent = EbooksContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const card_1 = require("./ui/card");
const button_1 = require("./ui/button");
const image_1 = __importDefault(require("next/image"));
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const utils_1 = require("@/lib/utils");
const back_button_1 = require("./back-button");
const ebooks = [
    {
        title: "The Art of Programming",
        description: "An essential guide to the fundamentals of computer programming and software design, covering algorithms, data structures, and more.",
        coverUrl: "https://placehold.co/300x400.png",
        aiHint: "programming book"
    },
    {
        title: "A Journey Through the Cosmos",
        description: "Explore the wonders of the universe, from the Big Bang to the most distant galaxies. A captivating read for astronomy enthusiasts.",
        coverUrl: "https://placehold.co/300x400.png",
        aiHint: "space galaxy"
    },
    {
        title: "The History of Ancient Civilizations",
        description: "A comprehensive look at the rise and fall of the world's most influential ancient societies, from Mesopotamia to Rome.",
        coverUrl: "https://placehold.co/300x400.png",
        aiHint: "ancient history"
    }
];
function EbooksContent() {
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-5xl", children: [(0, jsx_runtime_1.jsxs)("header", { className: "mb-8 text-center relative", children: [(0, jsx_runtime_1.jsx)(back_button_1.BackButton, { className: "absolute left-0 top-1/2 -translate-y-1/2" }), (0, jsx_runtime_1.jsx)(lucide_react_1.BookOpen, { className: "mx-auto h-12 w-12 text-primary" }), (0, jsx_runtime_1.jsx)("h1", { className: "mt-4 text-4xl font-bold tracking-tight", children: "eBook Library" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-lg text-muted-foreground", children: "Browse our curated collection of educational eBooks." })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center", children: ebooks.map((book, index) => ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: "flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: `/ebooks/${(0, utils_1.slugify)(book.title)}`, children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-0", children: (0, jsx_runtime_1.jsx)(image_1.default, { src: book.coverUrl, alt: `Cover of ${book.title}`, width: 300, height: 400, className: "w-full h-auto object-cover", "data-ai-hint": book.aiHint }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col flex-1 p-4", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: "p-0", children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-lg", children: book.title }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-0 flex-1 mt-2", children: (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: book.description }) }), (0, jsx_runtime_1.jsx)(card_1.CardFooter, { className: "p-0 mt-4", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: `/ebooks/${(0, utils_1.slugify)(book.title)}`, className: "w-full", children: (0, jsx_runtime_1.jsx)(button_1.Button, { className: "w-full", children: "Read Now" }) }) })] })] }, index))) })] }) }));
}
