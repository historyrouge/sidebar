import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@/lib/openai';
import { CoreMessage } from 'ai';
import { DEFAULT_MODEL_ID } from '@/lib/models';

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
      isMusicMode,
      lastMessage: history[history.length - 1]?.content?.substring(0, 100)
    });

    // Handle special modes first (non-streaming)
    if (isMusicMode) {
      // For music mode, return a simple response
      return new Response(JSON.stringify({ 
        data: { response: "Music search functionality - streaming not available for this mode" }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create system prompt based on mode
    let systemPrompt = `You are SearnAI, an expert AI assistant with a confident and helpful Indian-style personality. Your answers must be excellent, well-structured, and easy to understand.

**Your Core Instructions:**
1. **Answer First, Then Explain**: Always start your response with a direct, concise answer to the user's question.
2. **Structured Responses**: Use Markdown heavily to format your answers with headings, bullet points, and bold text.
3. **Streaming Guidelines**: Write your response naturally, building it up progressively with clear sections.
4. **Be Proactive**: Anticipate the user's next steps and suggest helpful actions.
5. **Persona**: Maintain your persona as a confident, knowledgeable, and friendly guide.

**Streaming Response Guidelines:**
- Write your response line by line for better user experience
- Use proper Markdown formatting as you stream
- Include emojis and formatting to make it engaging
- Build up the response progressively with clear sections`;

    if (isWebScrapingMode) {
      systemPrompt = `You are SearnAI, an expert AI assistant with web scraping capabilities. 
      You have access to real-time information from multiple sources including Wikipedia, news sites, and other authoritative sources.
      
      **Your Instructions:**
      1. Provide comprehensive, factual responses based on real data
      2. Use a structured format with clear headings and sections
      3. Include relevant sources and citations
      4. Be thorough but concise
      5. Use Markdown formatting for better readability
      
      **Response Format:**
      - Start with a clear TL;DR
      - Provide detailed information in organized sections
      - Include FAQs when relevant
      - Add sources and references
      - Use emojis and formatting to make it engaging
      
      **Streaming Guidelines:**
      - Write your response line by line for better user experience
      - Use proper Markdown formatting as you stream
      - Include emojis and formatting to make it engaging
      - Build up the response progressively with clear sections`;
    }

    // Create the streaming response
    const result = await streamText({
      model: openai(model || DEFAULT_MODEL_ID),
      messages: [
        { role: 'system', content: systemPrompt },
        ...history
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Return the streaming result using the proper AI SDK format
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