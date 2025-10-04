
"use server";

import { CoreMessage } from 'ai';
import { openai } from '@/lib/openai';
import { z }from 'zod';
import { generateFlashcardsSamba, GenerateFlashcardsSambaInput, GenerateFlashcardsSambaOutput } from '@/ai/flows/generate-flashcards-samba';
import { generateQuizzesSamba, GenerateQuizzesSambaInput, GenerateQuizzesSambaOutput } from '@/ai/flows/generate-quizzes-samba';
import { analyzeCode, AnalyzeCodeInput, AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { generateMindMap, GenerateMindMapInput, GenerateMindMapOutput } from '@/ai/flows/generate-mindmap';
import { generateQuestionPaper, GenerateQuestionPaperInput, GenerateQuestionPaperOutput } from '@/ai/flows/generate-question-paper';
import { generateEbookChapter, GenerateEbookChapterInput, GenerateEbookChapterOutput } from '@/ai/flows/generate-ebook-chapter';
import { generatePresentation, GeneratePresentationInput, GeneratePresentationOutput } from '@/ai/flows/generate-presentation';
import { generateEditedContent, GenerateEditedContentInput, GenerateEditedContentOutput } from '@/ai/flows/generate-edited-content';
import { helpChat, HelpChatInput, HelpChatOutput } from '@/ai/flows/help-chatbot';
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput } from '@/ai/flows/youtube-transcript';
import { imageToText, ImageToTextInput, ImageToTextOutput } from '@/ai/flows/image-to-text';
import { analyzeContent, AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/analyze-content';
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput } from '@/ai/flows/analyze-image-content';
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput } from '@/ai/flows/summarize-content';
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput } from '@/ai/flows/chat-tutor';
import { duckDuckGoSearch } from '@/ai/tools/duckduckgo-search';
import { searchYoutube } from '@/ai/tools/youtube-search';
import { browseWebsite } from '@/ai/tools/browse-website';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { DEFAULT_MODEL_ID } from '@/lib/models';
import { generateImage, GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-image";
import { ai } from '@/ai/genkit'; // Keep for other actions

export type ActionResult<T> = {
    data?: T;
    error?: string;
};

interface ScrapedData {
    title: string;
    content: string;
    url: string;
    summary: string;
    images?: string[];
}

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

// Function to search for relevant websites using DuckDuckGo
async function searchWebsites(query: string): Promise<SearchResult[]> {
    try {
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const response = await axios.get(searchUrl);
        
        const results: SearchResult[] = [];
        
        // Add instant answer if available
        if (response.data.AbstractText) {
            results.push({
                title: response.data.Heading || query,
                url: response.data.AbstractURL || '',
                snippet: response.data.AbstractText
            });
        }
        
        // Add related topics
        if (response.data.RelatedTopics) {
            response.data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.split(' - ')[0],
                        url: topic.FirstURL,
                        snippet: topic.Text
                    });
                }
            });
        }
        
        return results;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Function to scrape content from a URL
async function scrapeWebsite(url: string): Promise<ScrapedData | null> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        
        // Remove script and style elements
        $('script, style, nav, header, footer, aside').remove();
        
        // Extract title
        const title = $('title').text().trim() || 
                      $('h1').first().text().trim() || 
                      'Untitled';
        
        // Extract main content
        let content = '';
        
        // Try to find main content area
        const mainSelectors = [
            'main',
            'article',
            '.content',
            '.main-content',
            '.post-content',
            '.entry-content',
            '#content',
            '.container',
            'body'
        ];
        
        for (const selector of mainSelectors) {
            const element = $(selector);
            if (element.length && element.text().trim().length > 100) {
                content = element.text().trim();
                break;
            }
        }
        
        // If no main content found, get all text
        if (!content) {
            content = $('body').text().trim();
        }
        
        // Clean up content
        content = content
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
        
        // Extract images
        const images: string[] = [];
        $('img').each((_, img) => {
            const src = $(img).attr('src');
            if (src && !src.startsWith('data:')) {
                const fullUrl = src.startsWith('http') ? src : new URL(src, url).href;
                images.push(fullUrl);
            }
        });
        
        // Create a better summary by extracting key sentences
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const keySentences = sentences.slice(0, 2); // Take first 2 sentences
        const summary = keySentences.join('. ') + (keySentences.length > 0 ? '.' : '') + (content.length > 200 ? '...' : '');
        
        return {
            title,
            content,
            url,
            summary,
            images: images.slice(0, 5) // Limit to 5 images
        };
        
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return null;
    }
}

// Function to extract relevant information based on query
function extractRelevantInfo(content: string, query: string): string {
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Score sentences based on query word matches and context
    const scoredSentences = sentences.map(sentence => {
        const lowerSentence = sentence.toLowerCase();
        let score = 0;
        
        // Basic word matching
        queryWords.forEach(word => {
            if (lowerSentence.includes(word)) {
                score += 1;
            }
        });
        
        // Boost score for sentences that start with important words
        const importantStarters = ['the', 'this', 'it', 'he', 'she', 'they', 'we', 'you'];
        const firstWord = sentence.trim().split(' ')[0]?.toLowerCase();
        if (importantStarters.includes(firstWord)) {
            score += 0.5;
        }
        
        // Boost score for longer, more informative sentences
        if (sentence.length > 100) {
            score += 0.3;
        }
        
        return { sentence: sentence.trim(), score };
    });
    
    // Sort by score and take top sentences
    const relevantSentences = scoredSentences
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.sentence);
    
    return relevantSentences.join('. ') + '.';
}

function generateAnswer(scrapedData: ScrapedData[], query: string): string {
    if (scrapedData.length === 0) {
        return `I couldn't find specific information about "${query}". Please try rephrasing your question or providing specific URLs to scrape.`;
    }
    
    // Create a comprehensive answer in pure text format
    let answer = `${query.toUpperCase()}\n\n`;
    
    // Add introduction
    answer += `Based on information gathered from ${scrapedData.length} reliable source${scrapedData.length > 1 ? 's' : ''}, here's what I found:\n\n`;
    
    // Combine and organize information by topic
    const combinedInfo = scrapedData
        .map(source => source.content)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Extract key information and organize it
    const sentences = combinedInfo.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Group sentences by topic/keywords
    const topicGroups: { [key: string]: string[] } = {};
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        let bestTopic = 'general';
        let maxScore = 0;
        
        // Find the most relevant topic for this sentence
        queryWords.forEach(word => {
            if (lowerSentence.includes(word)) {
                const score = (lowerSentence.match(new RegExp(word, 'g')) || []).length;
                if (score > maxScore) {
                    maxScore = score;
                    bestTopic = word;
                }
            }
        });
        
        if (!topicGroups[bestTopic]) {
            topicGroups[bestTopic] = [];
        }
        topicGroups[bestTopic].push(sentence.trim());
    });
    
    // Create organized sections in pure text
    Object.entries(topicGroups).forEach(([topic, sentences]) => {
        if (sentences.length > 0) {
            const sectionTitle = topic === 'general' ? 'KEY INFORMATION' : `${topic.toUpperCase()}`;
            answer += `${sectionTitle}:\n`;
            
            // Take top 3-4 sentences for each topic
            const topSentences = sentences.slice(0, 4);
            answer += topSentences.join('. ') + '.\n\n';
        }
    });
    
    // Add summary section
    answer += `SUMMARY:\n`;
    const summarySentences = sentences.slice(0, 3);
    answer += summarySentences.join('. ') + '.\n\n';
    
    return answer;
}

export async function generateFlashcardsAction(input: GenerateFlashcardsSambaInput): Promise<ActionResult<GenerateFlashcardsSambaOutput>> {
    try {
        const data = await generateFlashcardsSamba(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateQuizAction(input: GenerateQuizzesSambaInput): Promise<ActionResult<GenerateQuizzesSambaOutput>> {
    try {
        const data = await generateQuizzesSamba(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function helpChatAction(input: HelpChatInput): Promise<ActionResult<HelpChatOutput>> {
    try {
        const data = await helpChat(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function textToSpeechAction(input: TextToSpeechInput): Promise<ActionResult<TextToSpeechOutput>> {
    try {
        const data = await textToSpeech(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getYoutubeTranscriptAction(input: GetYoutubeTranscriptInput): Promise<ActionResult<GetYoutubeTranscriptOutput>> {
    try {
        const data = await getYoutubeTranscript(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function analyzeCodeAction(input: AnalyzeCodeInput): Promise<ActionResult<AnalyzeCodeOutput>> {
    try {
        const data = await analyzeCode(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateMindMapAction(input: GenerateMindMapInput): Promise<ActionResult<GenerateMindMapOutput>> {
    try {
        const data = await generateMindMap(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateQuestionPaperAction(input: GenerateQuestionPaperInput): Promise<ActionResult<GenerateQuestionPaperOutput>> {
    try {
        const data = await generateQuestionPaper(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateEbookChapterAction(input: GenerateEbookChapterInput): Promise<ActionResult<GenerateEbookChapterOutput>> {
    try {
        const data = await generateEbookChapter(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generatePresentationAction(input: GeneratePresentationInput): Promise<ActionResult<GeneratePresentationOutput>> {
    try {
        const data = await generatePresentation(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateEditedContentAction(input: GenerateEditedContentInput): Promise<ActionResult<GenerateEditedContentOutput>> {
    try {
        const data = await generateEditedContent(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function imageToTextAction(input: ImageToTextInput): Promise<ActionResult<ImageToTextOutput>> {
    try {
        const data = await imageToText(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateImageAction(input: GenerateImageInput): Promise<ActionResult<GenerateImageOutput>> {
    try {
        const data = await generateImage(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function analyzeContentAction(content: string): Promise<ActionResult<AnalyzeContentOutput>> {
    try {
        const data = await analyzeContent({ content });
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function analyzeImageContentAction(input: AnalyzeImageContentInput): Promise<ActionResult<AnalyzeImageContentOutput>> {
    try {
        const data = await analyzeImageContent(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function summarizeContentAction(input: SummarizeContentInput): Promise<ActionResult<SummarizeContentOutput>> {
    try {
        const data = await summarizeContent(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function chatWithTutorAction(input: ChatWithTutorInput): Promise<ActionResult<ChatWithTutorOutput>> {
    try {
        const data = await chatWithTutor(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

// Main non-streaming chat action
export async function chatAction(input: {
    history: CoreMessage[],
    fileContent?: string | null,
    imageDataUri?: string | null,
    model?: string,
    isMusicMode?: boolean,
    isWebScrapingMode?: boolean,
}): Promise<ActionResult<{ response: string }>> {
    const isSearch = input.history[input.history.length - 1]?.content.toString().startsWith("Search:");
    const isMusic = input.isMusicMode;
    const isWebScraping = input.isWebScrapingMode;

    if (isSearch) {
        const query = input.history[input.history.length - 1].content.toString().replace(/^Search:\s*/i, '');
        try {
            const searchResults = await duckDuckGoSearch({ query });
            const results = JSON.parse(searchResults);

            if (results.length > 0) {
                const topResult = results[0];
                const websiteContent = await browseWebsite({ url: topResult.link });

                const responsePayload = {
                    type: 'website',
                    url: topResult.link,
                    title: topResult.title,
                    snippet: websiteContent.substring(0, 300) + '...'
                };

                return { data: { response: JSON.stringify(responsePayload) } };
            } else {
                return { data: { response: "Sorry, I couldn't find any relevant websites for that search." } };
            }
        } catch (error: any) {
            return { error: `Sorry, an error occurred during the search: ${'error.message'}` };
        }
    }

    if (isWebScraping) {
        const query = input.history[input.history.length - 1].content.toString();
        try {
            // Search for relevant websites
            const searchResults = await searchWebsites(query);
            let websitesToScrape: string[] = [];
            
            if (searchResults.length > 0) {
                websitesToScrape = searchResults.map(result => result.url).filter(url => url);
            }
            
            // Add some default reliable sources based on query type
            const defaultSources = [];
            
            // Add Wikipedia for general topics
            defaultSources.push('https://en.wikipedia.org/wiki/' + encodeURIComponent(query));
            
            // Add Britannica for educational content
            defaultSources.push('https://www.britannica.com/search?query=' + encodeURIComponent(query));
            
            // Add specific sources based on query keywords
            const lowerQuery = query.toLowerCase();
            if (lowerQuery.includes('science') || lowerQuery.includes('physics') || lowerQuery.includes('chemistry')) {
                defaultSources.push('https://www.scientificamerican.com/search/?q=' + encodeURIComponent(query));
            }
            if (lowerQuery.includes('history') || lowerQuery.includes('war') || lowerQuery.includes('ancient')) {
                defaultSources.push('https://www.history.com/search?q=' + encodeURIComponent(query));
            }
            if (lowerQuery.includes('technology') || lowerQuery.includes('computer') || lowerQuery.includes('ai')) {
                defaultSources.push('https://www.techcrunch.com/search/' + encodeURIComponent(query));
            }
            
            websitesToScrape = [...websitesToScrape, ...defaultSources].slice(0, 6);
            
            // Scrape all websites
            const scrapedData: ScrapedData[] = [];
            
            for (const url of websitesToScrape) {
                try {
                    const data = await scrapeWebsite(url);
                    if (data && data.content.length > 100) {
                        // Extract relevant information based on query
                        const relevantInfo = extractRelevantInfo(data.content, query);
                        if (relevantInfo.length > 50) {
                            scrapedData.push({
                                ...data,
                                content: relevantInfo
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Failed to scrape ${url}:`, error);
                }
            }
            
            // Generate a comprehensive answer
            const answer = generateAnswer(scrapedData, query);
            
            // Format the response with better source organization in pure text
            const sourcesText = scrapedData.map((source, index) => {
                const hostname = new URL(source.url).hostname;
                const domain = hostname.replace('www.', '');
                return `${index + 1}. ${source.title}\n   Source: ${domain}\n   URL: ${source.url}\n   Summary: ${source.summary}`;
            }).join('\n\n');

            const formattedResponse = `${answer}SOURCES USED:\n\n${sourcesText}\n\nTip: Visit the source URLs to read the full articles for more detailed information.`;
            
            return { data: { response: formattedResponse } };
        } catch (error: any) {
            return { error: `Sorry, an error occurred while scraping websites: ${error.message}` };
        }
    }

    if (isMusic) {
         const query = input.history[input.history.length - 1].content.toString();
         try {
            const video = await searchYoutube({ query });
            if (video.id) {
                const responsePayload = {
                    type: 'youtube',
                    videoId: video.id,
                    title: video.title,
                    thumbnail: video.thumbnail,
                };
                return { data: { response: JSON.stringify(responsePayload) } };
            } else {
                 return { data: { response: "Sorry, I couldn't find a matching song on YouTube." } };
            }
         } catch (error: any) {
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

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    input.history.forEach(msg => {
        if (msg.role === 'user' && input.imageDataUri) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: msg.content as string },
                    { type: 'image_url', image_url: { url: input.imageDataUri } }
                ]
            });
        } else {
            messages.push({ role: msg.role, content: msg.content });
        }
    });

    try {
        const response = await openai.chat.completions.create({
            model: input.model || DEFAULT_MODEL_ID,
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

        return { data: { response: result.data.response }};
    } catch (e: any) {
        console.error("SambaNova chat error:", e);
        return { error: e.message || "An unknown error occurred with the AI model." };
    }
}
