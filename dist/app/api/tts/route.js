"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const actions_1 = require("@/app/actions");
const server_1 = require("next/server");
async function POST(req) {
    try {
        const { text } = await req.json();
        if (!text) {
            return new server_1.NextResponse('Text is required', { status: 400 });
        }
        const audioStream = await (0, actions_1.streamTextToSpeech)(text);
        return new server_1.NextResponse(audioStream, {
            headers: {
                'Content-Type': 'audio/pcm',
            },
        });
    }
    catch (error) {
        console.error('TTS API Error:', error);
        return new server_1.NextResponse(error.message || 'Failed to generate audio', {
            status: 500,
        });
    }
}
