
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    // Dynamically import to avoid build-time errors
    const { streamTextToSpeech } = await import('@/app/actions');
    const audioStream = await streamTextToSpeech(text);

    return audioStream;
  } catch (error: any) {
    console.error('TTS API Error:', error);
    return new NextResponse(error.message || 'Failed to generate audio', {
      status: 500,
    });
  }
}

// Export a dynamic route config to prevent static optimization
export const dynamic = 'force-dynamic';
