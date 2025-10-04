"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebBrowserContent = WebBrowserContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("./ui/button");
const input_1 = require("./ui/input");
const lucide_react_1 = require("lucide-react");
const sidebar_1 = require("./ui/sidebar");
const navigation_1 = require("next/navigation");
function WebBrowserContent() {
    const [url, setUrl] = (0, react_1.useState)("https://example.com");
    const [displayUrl, setDisplayUrl] = (0, react_1.useState)("https://example.com");
    const iframeRef = (0, react_1.useRef)(null);
    const router = (0, navigation_1.useRouter)();
    const handleSubmit = (e) => {
        e.preventDefault();
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
        }
        setDisplayUrl(finalUrl);
    };
    const handleGoBack = () => {
        iframeRef.current?.contentWindow?.history.back();
    };
    const handleGoForward = () => {
        iframeRef.current?.contentWindow?.history.forward();
    };
    const handleRefresh = () => {
        iframeRef.current?.contentWindow?.location.reload();
    };
    const handleGoHome = () => {
        const homeUrl = "https://example.com";
        setDisplayUrl(homeUrl);
        setUrl(homeUrl);
    };
    (0, react_1.useEffect)(() => {
        handleGoHome();
    }, []);
    const isSecure = displayUrl.startsWith("https://");
    const proxiedUrl = `/api/proxy?url=${encodeURIComponent(displayUrl)}`;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full flex-col", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "md:hidden -ml-2" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: handleGoBack, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-5 w-5" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: handleGoForward, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "h-5 w-5" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: handleRefresh, children: (0, jsx_runtime_1.jsx)(lucide_react_1.RotateCw, { className: "h-5 w-5" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: handleGoHome, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Home, { className: "h-5 w-5" }) })] }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "flex-1 mx-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none", children: isSecure ? (0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "h-4 w-4 text-green-500" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "h-4 w-4 text-muted-foreground" }) }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: url, onChange: (e) => setUrl(e.target.value), className: "w-full pl-10", placeholder: "Enter a URL..." })] }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: () => router.back(), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-5 w-5" }) })] }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 bg-muted", children: (0, jsx_runtime_1.jsx)("iframe", { ref: iframeRef, src: proxiedUrl, className: "w-full h-full border-0", title: "Web Browser", sandbox: "allow-scripts allow-forms allow-popups allow-same-origin allow-top-navigation-by-user-activation", onLoad: () => {
                        // We can no longer read the URL due to the proxy. This is expected.
                    } }) })] }));
}
