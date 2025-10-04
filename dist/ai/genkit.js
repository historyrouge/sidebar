"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAI = exports.ai = void 0;
const genkit_1 = require("genkit");
const google_genai_1 = require("@genkit-ai/google-genai");
Object.defineProperty(exports, "googleAI", { enumerable: true, get: function () { return google_genai_1.googleAI; } });
exports.ai = (0, genkit_1.genkit)({
    plugins: [(0, google_genai_1.googleAI)()],
});
