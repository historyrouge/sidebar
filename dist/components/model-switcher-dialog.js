"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSwitcherDialog = ModelSwitcherDialog;
const jsx_runtime_1 = require("react/jsx-runtime");
const dialog_1 = require("./ui/dialog");
const radio_group_1 = require("./ui/radio-group");
const button_1 = require("./ui/button");
const label_1 = require("./ui/label");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ALL_MODELS = [
    { key: "gemini", name: "Gemini", description: "Google's powerful and versatile model." },
    { key: "samba", name: "SambaNova", description: "High-performance model for specific tasks." },
    { key: "puter", name: "Puter.js", description: "Runs directly and privately in your browser." },
];
function ModelSwitcherDialog({ isOpen, onOpenChange, currentModel, onModelSelect }) {
    const [selectedModel, setSelectedModel] = (0, react_1.useState)(null);
    const availableModels = ALL_MODELS.filter(m => m.key !== currentModel);
    const handleSubmit = () => {
        if (selectedModel) {
            onModelSelect(selectedModel);
        }
    };
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogHeader, { children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.WifiOff, { className: "text-destructive" }), "API Limit Reached"] }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogDescription, { children: ["The free API limit for the '", currentModel, "' model has been reached. Please switch to another model to continue."] })] }), (0, jsx_runtime_1.jsx)("div", { className: "py-4", children: (0, jsx_runtime_1.jsx)(radio_group_1.RadioGroup, { onValueChange: (value) => setSelectedModel(value), children: availableModels.map(model => ((0, jsx_runtime_1.jsxs)(label_1.Label, { htmlFor: model.key, className: "flex items-start gap-4 space-x-2 border rounded-md p-4 hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: model.key, id: model.key, className: "mt-1" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-semibold", children: model.name }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-muted-foreground", children: model.description })] })] }, model.key))) }) }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogFooter, { children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleSubmit, disabled: !selectedModel, children: "Switch and Retry" })] })] }) }));
}
