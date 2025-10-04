"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionPaperViewer = QuestionPaperViewer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const sidebar_1 = require("./ui/sidebar");
const back_button_1 = require("./back-button");
const separator_1 = require("./ui/separator");
function QuestionPaperViewer() {
    const [paper, setPaper] = (0, react_1.useState)(null);
    const router = (0, navigation_1.useRouter)();
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        try {
            const savedPaper = localStorage.getItem('questionPaper');
            if (savedPaper) {
                setPaper(JSON.parse(savedPaper));
            }
            else {
                toast({ title: "No Paper Found", description: "Please generate a question paper first.", variant: "destructive" });
                router.push('/question-paper');
            }
        }
        catch (e) {
            toast({ title: "Error", description: "Could not load the question paper data.", variant: "destructive" });
            router.push('/question-paper');
        }
    }, [router, toast]);
    const handlePrint = () => {
        const printContent = document.getElementById("printable-paper")?.innerHTML;
        if (!printContent)
            return;
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Question Paper</title>');
            printWindow.document.write('<style>body{font-family:sans-serif;padding:2rem}h1,h2,h3{margin-bottom:0.5rem;text-align:center;}ul{padding-left:1.5rem;margin-bottom:1rem}.question-item{margin-bottom:1rem;page-break-inside:avoid;}.marks{float:right;font-weight:bold;}.section-title{font-weight:bold;font-size:1.25rem;text-align:center;margin-top:1.5rem;margin-bottom:1rem;}.mcq-options{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 1rem;padding-left:1.5rem;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
    if (!paper) {
        return null; // Loading state is handled by the page's dynamic import
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col bg-muted/20 dark:bg-transparent", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Question Paper Viewer" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handlePrint, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Printer, { className: "mr-2 h-4 w-4" }), "Print"] })] }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "max-w-4xl mx-auto shadow-lg", id: "printable-paper", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: "text-center", children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-2xl font-bold", children: paper.title }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-6 px-8 py-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-semibold mb-2 text-center", children: "General Instructions:" }), (0, jsx_runtime_1.jsx)("ul", { className: "list-disc list-inside text-sm text-muted-foreground space-y-1 mx-auto max-w-2xl", children: paper.generalInstructions.map((inst, i) => (0, jsx_runtime_1.jsx)("li", { children: inst }, i)) })] }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), paper.sectionA?.length > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 pt-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "section-title", children: "Section A" }), paper.sectionA.map((q, i) => (0, jsx_runtime_1.jsxs)("div", { className: "question-item", children: [(0, jsx_runtime_1.jsxs)("p", { children: [i + 1, ". ", q.question, (0, jsx_runtime_1.jsxs)("span", { className: "marks", children: ["(", q.marks, ")"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mcq-options mt-2", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["(a) ", q.options.a] }), (0, jsx_runtime_1.jsxs)("span", { children: ["(b) ", q.options.b] }), (0, jsx_runtime_1.jsxs)("span", { children: ["(c) ", q.options.c] }), (0, jsx_runtime_1.jsxs)("span", { children: ["(d) ", q.options.d] })] })] }, i))] }), paper.sectionB?.length > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 pt-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "section-title", children: "Section B" }), paper.sectionB.map((q, i) => (0, jsx_runtime_1.jsx)("div", { className: "question-item", children: (0, jsx_runtime_1.jsxs)("p", { children: [i + 1, ". ", q.question, (0, jsx_runtime_1.jsxs)("span", { className: "marks", children: ["(", q.marks, ")"] })] }) }, i))] }), paper.sectionC?.length > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 pt-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "section-title", children: "Section C" }), paper.sectionC.map((q, i) => (0, jsx_runtime_1.jsx)("div", { className: "question-item", children: (0, jsx_runtime_1.jsxs)("p", { children: [i + 1, ". ", q.question, (0, jsx_runtime_1.jsxs)("span", { className: "marks", children: ["(", q.marks, ")"] })] }) }, i))] }), paper.sectionD?.length > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 pt-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "section-title", children: "Section D" }), paper.sectionD.map((q, i) => (0, jsx_runtime_1.jsx)("div", { className: "question-item", children: (0, jsx_runtime_1.jsxs)("p", { children: [i + 1, ". ", q.question, (0, jsx_runtime_1.jsxs)("span", { className: "marks", children: ["(", q.marks, ")"] })] }) }, i))] }), paper.sectionE?.length > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 pt-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "section-title", children: "Section E" }), paper.sectionE.map((c, i) => (0, jsx_runtime_1.jsxs)("div", { className: "question-item space-y-2", children: [(0, jsx_runtime_1.jsxs)("p", { className: "font-semibold", children: [i + 1, ". Case Study:"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground border-l-2 pl-4 italic", children: c.case }), c.questions.map((q, qi) => (0, jsx_runtime_1.jsxs)("p", { className: "pl-4", children: [String.fromCharCode(97 + qi), ") ", q.question, (0, jsx_runtime_1.jsxs)("span", { className: "marks", children: ["(", q.marks, ")"] })] }, qi))] }, i))] })] })] }) })] }));
}
