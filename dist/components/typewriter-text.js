"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypewriterText = TypewriterText;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function TypewriterText({ text, className, onComplete }) {
    const [displayedText, setDisplayedText] = (0, react_1.useState)("");
    const [isComplete, setIsComplete] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setDisplayedText("");
        setIsComplete(false);
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1));
                i++;
            }
            else {
                clearInterval(intervalId);
                setIsComplete(true);
                onComplete?.();
            }
        }, 20); // Adjust speed as needed
        return () => clearInterval(intervalId);
    }, [text, onComplete]);
    return ((0, jsx_runtime_1.jsx)("div", { className: className, children: (0, jsx_runtime_1.jsxs)("p", { className: "font-mono text-xs whitespace-pre-wrap", children: [displayedText, !isComplete && (0, jsx_runtime_1.jsx)("span", { className: "animate-ping", children: "\u258B" })] }) }));
}
