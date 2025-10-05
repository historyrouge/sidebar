import { NextRequest } from 'next/server';
import { streamChatAction } from '@/app/actions';
import { CoreMessage } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, isMusicMode, isWebScrapingMode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // Convert messages to CoreMessage format
    const history: CoreMessage[] = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    console.log('🚀 Starting streaming chat...', { 
      messageCount: history.length,
      model,
      isWebScrapingMode,
      isMusicMode
    });

    const result = await streamChatAction({
      history,
      model,
      isMusicMode: isMusicMode || false,
      isWebScrapingMode: isWebScrapingMode || false
    });

    // If it's a non-streaming result (search, music), return as JSON
    if (result && 'data' in result) {
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the streaming result
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('❌ Streaming chat error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Streaming chat failed'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}