import { NextRequest } from 'next/server';
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

    // Create a simple streaming response using ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Check if we have the required environment variables
          if (!process.env.SAMBANOVA_BASE_URL || !process.env.SAMBANOVA_API_KEY) {
            console.log('⚠️ Missing Sambanova credentials, using test mode');
            
            // Send a test streaming response
            const testResponse = `Hello! I'm SearnAI, your AI assistant. You asked: "${history[history.length - 1]?.content || 'your question'}".

This is a test streaming response. The streaming functionality is working, but we need to configure the Sambanova API credentials for full functionality.

Here's what I can help you with:
- Answering questions
- Providing explanations
- Creating content
- And much more!

What would you like to know?`;
            
            // Send the test response in chunks to simulate streaming
            const words = testResponse.split(' ');
            for (let i = 0; i < words.length; i++) {
              const word = words[i] + (i < words.length - 1 ? ' ' : '');
              controller.enqueue(new TextEncoder().encode(`0:${word}`));
              // Add a small delay to simulate streaming
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            controller.close();
            return;
          }

          console.log('🔄 Making API call to Sambanova...', {
            baseURL: process.env.SAMBANOVA_BASE_URL,
            model: model || DEFAULT_MODEL_ID,
            messageCount: history.length
          });

          // Make API call to Sambanova
          const response = await fetch(process.env.SAMBANOVA_BASE_URL + '/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`,
            },
            body: JSON.stringify({
              model: model || DEFAULT_MODEL_ID,
              messages: [
                { role: 'system', content: systemPrompt },
                ...history
              ],
              temperature: 0.7,
              max_tokens: 2000,
              stream: true,
            }),
          });

          console.log('📡 Sambanova response status:', response.status);
          console.log('📡 Sambanova response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Sambanova API error:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText
            });
            throw new Error(`Sambanova API error: ${response.status} - ${errorText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          console.log('📖 Starting to read streaming response...');
          const decoder = new TextDecoder();
          let buffer = '';
          let chunkCount = 0;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log('✅ Streaming completed, total chunks:', chunkCount);
                break;
              }

              chunkCount++;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              console.log(`📦 Processing chunk ${chunkCount}, lines: ${lines.length}`);

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    console.log('🏁 Received [DONE] signal, closing stream');
                    controller.close();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices?.[0]?.delta?.content) {
                      const content = parsed.choices[0].delta.content;
                      console.log('📝 Sending content:', content.substring(0, 50) + '...');
                      // Send the content in the AI SDK format
                      controller.enqueue(new TextEncoder().encode(`0:${content}`));
                    }
                  } catch (e) {
                    console.log('⚠️ JSON parse error for line:', line.substring(0, 100));
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
            console.log('🔒 Reader released');
          }
        } catch (error: any) {
          console.error('❌ Streaming error:', error);
          
          // Send a fallback response instead of erroring
          const fallbackResponse = `I apologize, but I'm experiencing technical difficulties with streaming. Here's a basic response to your query: "${history[history.length - 1]?.content || 'your question'}".

This is a fallback response while we work on fixing the streaming functionality. Please try again in a moment.`;
          
          // Send the fallback response in chunks to simulate streaming
          const words = fallbackResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            controller.enqueue(new TextEncoder().encode(`0:${word}`));
            // Add a small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('❌ Streaming chat error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Streaming chat failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}