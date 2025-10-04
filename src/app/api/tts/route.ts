
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    // Simplified TTS response for build compatibility
    return new NextResponse('TTS functionality temporarily disabled for build', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('TTS API Error:', error);
    return new NextResponse(error.message || 'Failed to generate audio', {
      status: 500,
    });
  }
}
