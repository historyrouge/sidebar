"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextToSpeechPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const text_to_speech_content_1 = require("@/components/text-to-speech-content");
function TextToSpeechPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(text_to_speech_content_1.TextToSpeechContent, {}) }));
}
