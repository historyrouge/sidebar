
import { streamTextToSpeech } from '@/app/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const audioStream = await streamTextToSpeech(text);

    return new NextResponse(audioStream, {
      headers: {
        'Content-Type': 'audio/pcm',
      },
    });
  } catch (error: any) {
    console.error('TTS API Error:', error);
    return new NextResponse(error.message || 'Failed to generate audio', {
      status: 500,
    });
  }
}
