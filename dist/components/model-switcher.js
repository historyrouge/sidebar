"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSwitcher = ModelSwitcher;
const jsx_runtime_1 = require("react/jsx-runtime");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
const models_1 = require("@/lib/models");
function ModelSwitcher({ selectedModel, onModelChange, disabled }) {
    const currentModelDetails = models_1.AVAILABLE_MODELS.find(m => m.id === selectedModel);
    return ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", variant: "ghost", className: "flex-shrink-0 h-9 gap-2 text-muted-foreground", disabled: disabled, children: [currentModelDetails?.logo ? (0, jsx_runtime_1.jsx)("span", { className: "text-lg", children: currentModelDetails.logo }) : (0, jsx_runtime_1.jsx)(lucide_react_1.BrainCircuit, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "hidden sm:inline", children: currentModelDetails?.name || selectedModel })] }) }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuContent, { children: (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuRadioGroup, { value: selectedModel, onValueChange: onModelChange, children: models_1.AVAILABLE_MODELS.map(model => ((0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuRadioItem, { value: model.id, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [model.logo && (0, jsx_runtime_1.jsx)("span", { className: "text-lg", children: model.logo }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: model.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: model.description })] })] }) }, model.id))) }) })] }));
}
