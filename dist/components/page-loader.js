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
exports.PageLoader = PageLoader;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const nprogress_1 = __importDefault(require("nprogress"));
require("nprogress/nprogress.css");
function NProgressLogic() {
    const pathname = (0, navigation_1.usePathname)();
    const searchParams = (0, navigation_1.useSearchParams)();
    (0, react_1.useEffect)(() => {
        nprogress_1.default.done();
    }, [pathname, searchParams]);
    return null;
}
function PageLoader({ children }) {
    (0, react_1.useEffect)(() => {
        nprogress_1.default.configure({ showSpinner: false });
        const handleAnchorClick = (event) => {
            const targetUrl = event.currentTarget.href;
            const currentUrl = window.location.href;
            if (targetUrl !== currentUrl) {
                nprogress_1.default.start();
            }
        };
        const handleMutation = () => {
            const anchorElements = document.querySelectorAll('a');
            anchorElements.forEach(anchor => anchor.addEventListener('click', handleAnchorClick));
        };
        const mutationObserver = new MutationObserver(handleMutation);
        mutationObserver.observe(document.body, { childList: true, subtree: true });
        // Fallback for initial load
        nprogress_1.default.done();
        return () => {
            mutationObserver.disconnect();
            const anchorElements = document.querySelectorAll('a');
            anchorElements.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
        };
    }, []);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: null, children: (0, jsx_runtime_1.jsx)(NProgressLogic, {}) }), children] }));
}
