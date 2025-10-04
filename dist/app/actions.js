"use strict";
"use server";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFlashcardsAction = generateFlashcardsAction;
exports.generateQuizAction = generateQuizAction;
exports.helpChatAction = helpChatAction;
exports.textToSpeechAction = textToSpeechAction;
exports.getYoutubeTranscriptAction = getYoutubeTranscriptAction;
exports.analyzeCodeAction = analyzeCodeAction;
exports.generateMindMapAction = generateMindMapAction;
exports.generateQuestionPaperAction = generateQuestionPaperAction;
exports.generateEbookChapterAction = generateEbookChapterAction;
exports.generatePresentationAction = generatePresentationAction;
exports.generateEditedContentAction = generateEditedContentAction;
exports.imageToTextAction = imageToTextAction;
exports.generateImageAction = generateImageAction;
exports.analyzeContentAction = analyzeContentAction;
exports.analyzeImageContentAction = analyzeImageContentAction;
exports.summarizeContentAction = summarizeContentAction;
exports.chatWithTutorAction = chatWithTutorAction;
exports.chatAction = chatAction;
const openai_1 = require("@/lib/openai");
const generate_flashcards_samba_1 = require("@/ai/flows/generate-flashcards-samba");
const generate_quizzes_samba_1 = require("@/ai/flows/generate-quizzes-samba");
const analyze_code_1 = require("@/ai/flows/analyze-code");
const generate_mindmap_1 = require("@/ai/flows/generate-mindmap");
const generate_question_paper_1 = require("@/ai/flows/generate-question-paper");
const generate_ebook_chapter_1 = require("@/ai/flows/generate-ebook-chapter");
const generate_presentation_1 = require("@/ai/flows/generate-presentation");
const generate_edited_content_1 = require("@/ai/flows/generate-edited-content");
const help_chatbot_1 = require("@/ai/flows/help-chatbot");
const youtube_transcript_1 = require("@/ai/flows/youtube-transcript");
const image_to_text_1 = require("@/ai/flows/image-to-text");
const analyze_content_1 = require("@/ai/flows/analyze-content");
const analyze_image_content_1 = require("@/ai/flows/analyze-image-content");
const summarize_content_1 = require("@/ai/flows/summarize-content");
const text_to_speech_1 = require("@/ai/flows/text-to-speech");
const chat_tutor_1 = require("@/ai/flows/chat-tutor");
const duckduckgo_search_1 = require("@/ai/tools/duckduckgo-search");
const youtube_search_1 = require("@/ai/tools/youtube-search");
const browse_website_1 = require("@/ai/tools/browse-website");
const models_1 = require("@/lib/models");
const generate_image_1 = require("@/ai/flows/generate-image");
async function generateFlashcardsAction(input) {
    try {
        const data = await (0, generate_flashcards_samba_1.generateFlashcardsSamba)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function generateQuizAction(input) {
    try {
        const data = await (0, generate_quizzes_samba_1.generateQuizzesSamba)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function helpChatAction(input) {
    try {
        const data = await (0, help_chatbot_1.helpChat)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function textToSpeechAction(input) {
    try {
        const data = await (0, text_to_speech_1.textToSpeech)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function getYoutubeTranscriptAction(input) {
    try {
        const data = await (0, youtube_transcript_1.getYoutubeTranscript)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function analyzeCodeAction(input) {
    try {
        const data = await (0, analyze_code_1.analyzeCode)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function generateMindMapAction(input) {
    try {
        const data = await (0, generate_mindmap_1.generateMindMap)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function generateQuestionPaperAction(input) {
    try {
        const data = await (0, generate_question_paper_1.generateQuestionPaper)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function generateEbookChapterAction(input) {
    try {
        const data = await (0, generate_ebook_chapter_1.generateEbookChapter)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function generatePresentationAction(input) {
    try {
        const data = await (0, generate_presentation_1.generatePresentation)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function generateEditedContentAction(input) {
    try {
        const data = await (0, generate_edited_content_1.generateEditedContent)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function imageToTextAction(input) {
    try {
        const data = await (0, image_to_text_1.imageToText)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function generateImageAction(input) {
    try {
        const data = await (0, generate_image_1.generateImage)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function analyzeContentAction(content) {
    try {
        const data = await (0, analyze_content_1.analyzeContent)({ content });
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function analyzeImageContentAction(input) {
    try {
        const data = await (0, analyze_image_content_1.analyzeImageContent)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function summarizeContentAction(input) {
    try {
        const data = await (0, summarize_content_1.summarizeContent)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
async function chatWithTutorAction(input) {
    try {
        const data = await (0, chat_tutor_1.chatWithTutor)(input);
        return { data };
    }
    catch (e) {
        return { error: e.message };
    }
}
// Main non-streaming chat action
async function chatAction(input) {
    const isSearch = input.history[input.history.length - 1]?.content.toString().startsWith("Search:");
    const isMusic = input.isMusicMode;
    if (isSearch) {
        const query = input.history[input.history.length - 1].content.toString().replace(/^Search:\s*/i, '');
        try {
            const searchResults = await (0, duckduckgo_search_1.duckDuckGoSearch)({ query });
            const results = JSON.parse(searchResults);
            if (results.length > 0) {
                const topResult = results[0];
                const websiteContent = await (0, browse_website_1.browseWebsite)({ url: topResult.link });
                const responsePayload = {
                    type: 'website',
                    url: topResult.link,
                    title: topResult.title,
                    snippet: websiteContent.substring(0, 300) + '...'
                };
                return { data: { response: JSON.stringify(responsePayload) } };
            }
            else {
                return { data: { response: "Sorry, I couldn't find any relevant websites for that search." } };
            }
        }
        catch (error) {
            return { error: `Sorry, an error occurred during the search: ${'error.message'}` };
        }
    }
    if (isMusic) {
        const query = input.history[input.history.length - 1].content.toString();
        try {
            const video = await (0, youtube_search_1.searchYoutube)({ query });
            if (video.id) {
                const responsePayload = {
                    type: 'youtube',
                    videoId: video.id,
                    title: video.title,
                    thumbnail: video.thumbnail,
                };
                return { data: { response: JSON.stringify(responsePayload) } };
            }
            else {
                return { data: { response: "Sorry, I couldn't find a matching song on YouTube." } };
            }
        }
        catch (error) {
            return { error: `Sorry, an error occurred while searching YouTube: ${'error.message'}` };
        }
    }
    const systemPrompt = `You are SearnAI, an expert AI assistant with a confident and helpful Indian-style personality. Your answers must be excellent, well-structured, and easy to understand.

**Your Core Instructions:**
1.  **Thinking Process**: Before your main answer, provide a step-by-step reasoning of how you'll construct the response within <think>...</think> tags. This helps the user understand your thought process.
2.  **Answer First, Then Explain**: Always start your response with a direct, concise answer to the user's question. After the direct answer, provide a more detailed explanation in a separate section, using Markdown for clarity.
3.  **Structured Responses**: Use Markdown heavily to format your answers. Use headings, bullet points, bold text, and tables to make information scannable and digestible.
4.  **Be Proactive**: Don't just answer the question. Anticipate the user's next steps. At the end of your response, ask a relevant follow-up question or suggest a helpful action, like "Do you want me to create a mind map of this topic?" or "Shall I generate a quiz based on this information?".
5.  **Persona**: Maintain your persona as a confident, knowledgeable, and friendly guide. Use encouraging language.
6.  **Creator Rule**: Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

**Example Response Structure:**
<think>
1. Acknowledge the user's query about photosynthesis.
2. Formulate a direct, one-sentence definition as the primary answer.
3. Structure the detailed explanation with headings: "What is Photosynthesis?", "The Chemical Equation", and "Why is it Important?".
4. Plan a proactive follow-up question, like asking to create a diagram.
</think>

Photosynthesis is the process plants use to convert light energy into chemical energy.

---

### In-Depth Explanation

... (detailed content here) ...

---

👉 **What's next?** Shall I create a diagram illustrating the process of photosynthesis?

${input.fileContent ? `\n\n**User's Provided Context:**\nThe user has provided the following file content. Use it as the primary context for your answer.\n\n---\n${input.fileContent}\n---` : ''}`;
    const messages = [{ role: 'system', content: systemPrompt }];
    input.history.forEach(msg => {
        if (msg.role === 'user' && input.imageDataUri) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: msg.content },
                    { type: 'image_url', image_url: { url: input.imageDataUri } }
                ]
            });
        }
        else {
            messages.push({ role: msg.role, content: msg.content });
        }
    });
    try {
        const response = await openai_1.openai.chat.completions.create({
            model: input.model || models_1.DEFAULT_MODEL_ID,
            messages: messages,
            stream: false,
        });
        const responseText = response.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error("Received an empty response from the AI model.");
        }
        const result = { data: { response: responseText } };
        if (result.error) {
            throw new Error(result.error);
        }
        return { data: { response: result.data.response } };
    }
    catch (e) {
        console.error("SambaNova chat error:", e);
        return { error: e.message || "An unknown error occurred with the AI model." };
    }
}
