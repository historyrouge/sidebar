
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
import CustomAIAgent from '@/lib/custom-ai-agent';
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
    
    // Combine and clean information from all sources
    const combinedInfo = scrapedData
        .map(source => source.content)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Extract clean sentences (remove HTML/CSS noise)
    const sentences = combinedInfo
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 20)
        .map(s => cleanSentence(s))
        .filter(s => s.length > 20)
        .filter(s => !s.includes('css') && !s.includes('stylesheet') && !s.includes('html'))
        .filter(s => !s.includes('style') && !s.includes('border') && !s.includes('position'))
        .filter(s => !s.includes('width') && !s.includes('height') && !s.includes('alt'))
        .filter(s => !s.includes('type1x1') && !s.includes('amp;usesul'))
        .filter(s => !s.includes('Wikipedia') && !s.includes('free encyclopedia'))
        .filter(s => !s.includes('Redirected from') && !s.includes('Look up'))
        .filter(s => !s.includes('Categories:') && !s.includes('Disambiguation'))
        .filter(s => !s.includes('You searched for') && !s.includes('Click here'))
        .filter(s => !s.includes('See also') && !s.includes('All pages'))
        .filter(s => !s.includes('Topics referred') && !s.includes('disambiguation page'))
        .filter(s => !s.includes('titlePythonoldid') && !s.includes('Short description'))
        .filter(s => !s.includes('Hidden categories') && !s.includes('Human name'))
        .filter(s => !s.includes('Animal common name') && !s.includes('given-name-holder'))
        .filter(s => !s.includes('Found 3,166 results') && !s.includes('Search Sessions'))
        .filter(s => !s.includes('Maxwell Zeff') && !s.includes('Anthony Ha') && !s.includes('Kyle Wiggers'))
        .filter(s => !s.includes('Brian Heater') && !s.includes('Feb 10, 2025') && !s.includes('Jun 11, 2025'))
        .filter(s => !s.includes('In Brief') && !s.includes('Court filings') && !s.includes('TechCrunch Disrupt'))
        .filter(s => !s.includes('Government Policy') && !s.includes('AI CoreWeave') && !s.includes('Meta names'))
        .filter(s => !s.includes('Acquisition Reflects') && !s.includes('Perplexity AI'))
        .filter(s => !s.includes('Qpresident_of_indiahere') && !s.includes('QVice_President_of_Indiahere'))
        .filter(s => !s.includes('Doesnt') && !s.includes('if it doesnt happen automatically'))
        .filter(s => !s.includes('first, and to date, the only, woman to hold the post'))
        .filter(s => !s.includes('nationalisation of banks') && !s.includes('end of allowances'))
        .filter(s => !s.includes('erstwhile princely states') && !s.includes('British Indian Empire'))
        .filter(s => !s.includes('Government of India (Allocation of Business) Rules, 1961'))
        .filter(s => !s.includes('Indian Administrative Service (IAS)') && !s.includes('Indian Foreign Service (IFS)'))
        .filter(s => !s.match(/^[0-9\s]+$/)) // Remove pure numbers
        .filter(s => !s.match(/^[a-zA-Z\s]{1,3}$/)) // Remove very short words
        .filter(s => !s.match(/^[A-Z\s]+$/)) // Remove pure uppercase (likely headers)
        .filter(s => s.split(' ').length >= 5) // Must have at least 5 words
        .filter(s => !s.endsWith(':')) // Remove incomplete sentences ending with colon
        .filter(s => !s.endsWith('and') && !s.endsWith('or') && !s.endsWith('the')) // Remove incomplete sentences
        .filter(s => !s.includes('office is headed by') && !s.includes('principal secretary')); // Remove administrative details
    
    // Create category-based organization
    const categories = categorizeContent(sentences, query);
    
    // Generate TL;DR summary
    const tldr = generateTLDR(categories, query);
    const finalTldr = generateFinalTLDR(categories, query);
    
    // Build the organized answer
    let answer = `${query.toUpperCase()} – Multiple Meanings\n\n`;
    answer += `👉 ${tldr}\n\n`;
    
    // Add categorized sections with bullets
    Object.entries(categories).forEach(([category, facts]) => {
        if (facts.length > 0) {
            const emoji = getCategoryEmoji(category);
            answer += `${emoji} ${category}\n\n`;
            
            // Group related facts and add bullets
            const groupedFacts = groupRelatedFacts(facts);
            groupedFacts.forEach(group => {
                if (group.length === 1) {
                    answer += `${group[0]}\n\n`;
                } else {
                    // Create a better header for the group
                    const header = createGroupHeader(group[0], category);
                    answer += `${header}:\n`;
                    group.slice(1).forEach(fact => {
                        answer += `• ${fact}\n`;
                    });
                    answer += '\n';
                }
            });
        }
    });
    
    // Add final TL;DR at the end
    answer += `\n${finalTldr}`;
    
    return answer;
}

function categorizeContent(sentences: string[], query: string): { [key: string]: string[] } {
    const categories: { [key: string]: string[] } = {};
    const queryLower = query.toLowerCase();
    
    // Define category keywords with better physics/science coverage
    const categoryKeywords = {
        'Physics': ['physics', 'physical', 'force', 'motion', 'acceleration', 'velocity', 'momentum', 'mass', 'energy', 'law', 'principle', 'newton', 'mechanics', 'dynamics', 'kinematics'],
        'Biology': ['species', 'genus', 'family', 'animal', 'snake', 'reptile', 'wildlife', 'habitat', 'evolution', 'organism', 'living'],
        'Computing': ['programming', 'language', 'software', 'computer', 'code', 'algorithm', 'development', 'coding', 'programming'],
        'Mythology': ['myth', 'legend', 'greek', 'roman', 'ancient', 'god', 'goddess', 'serpent', 'dragon', 'mythology'],
        'People': ['person', 'individual', 'human', 'born', 'died', 'lived', 'philosopher', 'artist', 'scientist', 'mathematician', 'physicist', 'narendra', 'modi', 'current', 'serving'],
        'Politics': ['government', 'ministry', 'parliament', 'constitution', 'law', 'powers', 'political', 'democracy', 'election', 'cabinet', 'ministers'],
        'Technology': ['technology', 'tech', 'innovation', 'device', 'system', 'digital', 'electronic', 'engineering'],
        'History': ['historical', 'history', 'war', 'battle', 'ancient', 'medieval', 'century', 'era', 'published', 'formulated', 'former', 'previous'],
        'Culture': ['culture', 'cultural', 'art', 'music', 'film', 'entertainment', 'comedy', 'group', 'entertainment'],
        'Science': ['science', 'scientific', 'research', 'study', 'experiment', 'theory', 'discovery', 'mathematics', 'chemistry'],
        'Geography': ['country', 'city', 'location', 'place', 'region', 'continent', 'nation', 'geography'],
        'Other Uses': ['other', 'also', 'additionally', 'furthermore', 'moreover', 'besides', 'application', 'use']
    };
    
    sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        let bestCategory = 'Other Uses';
        let maxScore = 0;
        
        // Find the best category for this sentence
        Object.entries(categoryKeywords).forEach(([category, keywords]) => {
            let score = 0;
            keywords.forEach(keyword => {
                if (lowerSentence.includes(keyword)) {
                    score += 1;
                }
            });
            if (score > maxScore) {
                maxScore = score;
                bestCategory = category;
            }
        });
        
        // Special handling for query-specific categories
        if (queryLower.includes('python')) {
            if (lowerSentence.includes('snake') || lowerSentence.includes('reptile')) {
                bestCategory = 'Biology';
            } else if (lowerSentence.includes('programming') || lowerSentence.includes('code')) {
                bestCategory = 'Computing';
            } else if (lowerSentence.includes('myth') || lowerSentence.includes('apollo')) {
                bestCategory = 'Mythology';
            }
        } else if (queryLower.includes('newton') || queryLower.includes('law') || queryLower.includes('motion')) {
            if (lowerSentence.includes('force') || lowerSentence.includes('acceleration') || lowerSentence.includes('momentum')) {
                bestCategory = 'Physics';
            } else if (lowerSentence.includes('isaac') || lowerSentence.includes('newton')) {
                bestCategory = 'People';
            } else if (lowerSentence.includes('published') || lowerSentence.includes('1687') || lowerSentence.includes('principia')) {
                bestCategory = 'History';
            }
        } else if (queryLower.includes('openai') || queryLower.includes('founder') || queryLower.includes('ceo')) {
            if (lowerSentence.includes('sam altman') || lowerSentence.includes('elon musk') || lowerSentence.includes('founder') || lowerSentence.includes('ceo')) {
                bestCategory = 'People';
            } else if (lowerSentence.includes('artificial intelligence') || lowerSentence.includes('ai') || lowerSentence.includes('chatgpt')) {
                bestCategory = 'Technology';
            } else if (lowerSentence.includes('company') || lowerSentence.includes('startup') || lowerSentence.includes('business')) {
                bestCategory = 'Technology';
            }
        } else if (queryLower.includes('pm') || queryLower.includes('prime minister') || queryLower.includes('india')) {
            if (lowerSentence.includes('narendra modi') || lowerSentence.includes('current') || lowerSentence.includes('serving')) {
                bestCategory = 'People';
            } else if (lowerSentence.includes('government') || lowerSentence.includes('ministry') || lowerSentence.includes('parliament')) {
                bestCategory = 'Politics';
            } else if (lowerSentence.includes('history') || lowerSentence.includes('former') || lowerSentence.includes('previous')) {
                bestCategory = 'History';
            } else if (lowerSentence.includes('constitution') || lowerSentence.includes('law') || lowerSentence.includes('powers')) {
                bestCategory = 'Politics';
            }
        }
        
        if (!categories[bestCategory]) {
            categories[bestCategory] = [];
        }
        
        // Clean and add the fact
        const cleanFact = cleanSentence(sentence);
        if (cleanFact && !categories[bestCategory].includes(cleanFact)) {
            // Further clean the fact to make it more readable
            const finalFact = formatFact(cleanFact, query);
            if (finalFact && finalFact.length > 10) {
                categories[bestCategory].push(finalFact);
            }
        }
    });
    
    // Limit facts per category
    Object.keys(categories).forEach(category => {
        categories[category] = categories[category].slice(0, 4);
    });
    
    return categories;
}

function formatFact(fact: string, query: string): string {
    // Capitalize first letter
    let formatted = fact.charAt(0).toUpperCase() + fact.slice(1);
    
    // Remove redundant words at the beginning
    formatted = formatted.replace(/^(The|A|An)\s+/i, '');
    
    // Clean up common patterns
    formatted = formatted.replace(/\s+is\s+a\s+/gi, ' is a ');
    formatted = formatted.replace(/\s+is\s+an\s+/gi, ' is an ');
    formatted = formatted.replace(/\s+is\s+the\s+/gi, ' is the ');
    
    // Fix incomplete sentences
    formatted = formatted.replace(/\.\.\.$/, '.');
    formatted = formatted.replace(/and\.$/, '.');
    formatted = formatted.replace(/of\.$/, '.');
    formatted = formatted.replace(/the\.$/, '.');
    formatted = formatted.replace(/ai\.$/, 'AI.');
    formatted = formatted.replace(/ceo\.$/, 'CEO.');
    
    // Remove trailing periods if there are multiple
    formatted = formatted.replace(/\.+$/, '.');
    
    // Ensure it ends with a period
    if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
        formatted += '.';
    }
    
    // Make sure it's a complete sentence (has a verb)
    if (!formatted.includes(' is ') && !formatted.includes(' are ') && !formatted.includes(' was ') && 
        !formatted.includes(' were ') && !formatted.includes(' has ') && !formatted.includes(' have ') &&
        !formatted.includes(' can ') && !formatted.includes(' will ') && !formatted.includes(' do ') &&
        !formatted.includes(' does ') && !formatted.includes(' did ') && !formatted.includes(' founded ') &&
        !formatted.includes(' developed ') && !formatted.includes(' created ')) {
        // Try to make it a complete sentence
        if (formatted.includes(':')) {
            formatted = formatted.replace(':', ' is');
        } else if (formatted.includes('CEO of')) {
            formatted = formatted.replace('CEO of', 'is CEO of');
        } else if (formatted.includes('founder of')) {
            formatted = formatted.replace('founder of', 'is founder of');
        } else if (formatted.includes('American entrepreneur')) {
            formatted = formatted.replace('American entrepreneur', 'is an American entrepreneur');
        } else if (formatted.includes('Prime Minister of India')) {
            formatted = formatted.replace('Prime Minister of India', 'is the Prime Minister of India');
        } else if (formatted.includes('current Prime Minister')) {
            formatted = formatted.replace('current Prime Minister', 'is the current Prime Minister');
        } else if (formatted.includes('serving as')) {
            formatted = formatted.replace('serving as', 'is serving as');
        }
    }
    
    // Clean up common patterns
    formatted = formatted.replace(/\s+/g, ' ');
    formatted = formatted.replace(/^\s+|\s+$/g, '');
    
    return formatted.trim();
}

function cleanSentence(sentence: string): string {
    return sentence
        // Remove HTML/CSS fragments and technical junk
        .replace(/style[^>]*>/gi, '')
        .replace(/border:\s*[^;]+;/gi, '')
        .replace(/position:\s*[^;]+;/gi, '')
        .replace(/width\d+/gi, '')
        .replace(/height\d+/gi, '')
        .replace(/alt\s+width\d+/gi, '')
        .replace(/type\d+x\d+/gi, '')
        .replace(/amp;usesul\d+/gi, '')
        .replace(/Retrieved from https?:\/\/[^\s]+/gi, '')
        .replace(/https?:\/\/[^\s]+/gi, '')
        .replace(/www\.[^\s]+/gi, '')
        .replace(/\.com[^\s]*/gi, '')
        .replace(/\.org[^\s]*/gi, '')
        .replace(/\.edu[^\s]*/gi, '')
        .replace(/en\.wikipedia\.org[^\s]*/gi, '')
        .replace(/duckduckgo\.com[^\s]*/gi, '')
        .replace(/britannica\.com[^\s]*/gi, '')
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove CSS properties
        .replace(/[a-zA-Z-]+:\s*[^;]+;/g, '')
        // Remove Wikipedia-specific junk
        .replace(/From Wikipedia, the free encyclopedia/gi, '')
        .replace(/Redirected from [^\s]+/gi, '')
        .replace(/Look up [^,]+ in Wiktionary/gi, '')
        .replace(/the free dictionary/gi, '')
        .replace(/Categories: [^.]*/gi, '')
        .replace(/Disambiguation pages[^.]*/gi, '')
        .replace(/Hidden categories:[^.]*/gi, '')
        .replace(/You searched for: Search/gi, '')
        .replace(/Click here to search/gi, '')
        .replace(/See alsoedit/gi, '')
        .replace(/All pages with titles[^.]*/gi, '')
        .replace(/Topics referred to by the same term/gi, '')
        .replace(/This disambiguation page[^.]*/gi, '')
        .replace(/If an internal link[^.]*/gi, '')
        .replace(/titlePythonoldid\d+/gi, '')
        .replace(/Short description is different from Wikidata/gi, '')
        .replace(/All article disambiguation pages/gi, '')
        .replace(/Animal common name disambiguation pages/gi, '')
        .replace(/Human name disambiguation pages/gi, '')
        .replace(/Disambiguation pages with given-name-holder lists/gi, '')
        // Remove news article metadata
        .replace(/Maxwell Zeff\s+\w+\s+\d+,\s+\d+/gi, '')
        .replace(/Anthony Ha\s+\w+\s+\d+,\s+\d+/gi, '')
        .replace(/Kyle Wiggers\s+\w+\s+\d+,\s+\d+/gi, '')
        .replace(/Brian Heater\s+\w+\s+\d+,\s+\d+/gi, '')
        .replace(/Feb\s+\d+,\s+\d+/gi, '')
        .replace(/Jun\s+\d+,\s+\d+/gi, '')
        .replace(/Apr\s+\d+,\s+\d+/gi, '')
        .replace(/Jul\s+\d+,\s+\d+/gi, '')
        .replace(/May\s+\d+,\s+\d+/gi, '')
        // Remove special characters but keep basic punctuation
        .replace(/[^\w\s.,:;!?()-]/g, '')
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .trim();
}

function generateTLDR(categories: { [key: string]: string[] }, query: string): string {
    const categoryNames = Object.keys(categories).filter(cat => categories[cat].length > 0);
    
    if (categoryNames.length === 1) {
        return `"${query}" primarily refers to ${categoryNames[0].toLowerCase()}.`;
    } else if (categoryNames.length === 2) {
        return `"${query}" can mean ${categoryNames[0].toLowerCase()} or ${categoryNames[1].toLowerCase()}.`;
    } else {
        const lastCategory = categoryNames.pop();
        const otherCategories = categoryNames.join(', ').toLowerCase();
        return `"${query}" has several meanings across ${otherCategories}, and ${lastCategory?.toLowerCase()}.`;
    }
}

function generateFinalTLDR(categories: { [key: string]: string[] }, query: string): string {
    const categoryEmojis: { [key: string]: string } = {
        'Biology': '🐍',
        'Computing': '💻',
        'Mythology': '🏛️',
        'People': '👤',
        'Technology': '🔧',
        'History': '📜',
        'Culture': '🎭',
        'Science': '🔬',
        'Geography': '🌍',
        'Other Uses': '🎢'
    };
    
    const activeCategories = Object.keys(categories).filter(cat => categories[cat].length > 0);
    const emojiText = activeCategories.map(cat => {
        const emoji = categoryEmojis[cat] || '📋';
        const shortName = cat.toLowerCase();
        return `${shortName} ${emoji}`;
    }).join(', ');
    
    return `✨ TL;DR: "${query}" can mean ${emojiText}`;
}

function groupRelatedFacts(facts: string[]): string[][] {
    const groups: string[][] = [];
    const processed = new Set<string>();
    
    facts.forEach(fact => {
        if (processed.has(fact)) return;
        
        const group = [fact];
        processed.add(fact);
        
        // Find related facts
        facts.forEach(otherFact => {
            if (processed.has(otherFact)) return;
            
            // Check if facts are related (share keywords or are about same topic)
            if (areRelatedFacts(fact, otherFact)) {
                group.push(otherFact);
                processed.add(otherFact);
            }
        });
        
        groups.push(group);
    });
    
    return groups;
}

function areRelatedFacts(fact1: string, fact2: string): boolean {
    const words1 = fact1.toLowerCase().split(/\s+/);
    const words2 = fact2.toLowerCase().split(/\s+/);
    
    // Check for common meaningful words (longer than 3 characters)
    const commonWords = words1.filter(word => 
        word.length > 3 && words2.includes(word)
    );
    
    return commonWords.length >= 1;
}

function createGroupHeader(firstFact: string, category: string): string {
    // Extract key terms from the first fact to create a meaningful header
    const words = firstFact.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => 
        word.length > 3 && 
        !['that', 'this', 'with', 'from', 'they', 'them', 'their', 'there', 'where', 'when', 'what', 'which', 'who'].includes(word)
    );
    
    if (keyWords.length > 0) {
        const header = keyWords.slice(0, 2).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        return header;
    }
    
    // Fallback to category-based headers
    const categoryHeaders: { [key: string]: string } = {
        'Physics': 'Key Concepts',
        'Biology': 'Species Information',
        'Computing': 'Programming Details',
        'People': 'Historical Figures',
        'History': 'Historical Context',
        'Culture': 'Cultural Aspects',
        'Science': 'Scientific Facts',
        'Other Uses': 'Additional Applications'
    };
    
    return categoryHeaders[category] || 'Key Information';
}

function getCategoryEmoji(category: string): string {
    const emojis: { [key: string]: string } = {
        'Physics': '⚡',
        'Biology': '🐍',
        'Computing': '💻',
        'Mythology': '🏛️',
        'People': '👤',
        'Politics': '🏛️',
        'Technology': '🔧',
        'History': '📜',
        'Culture': '🎭',
        'Science': '🔬',
        'Geography': '🌍',
        'Other Uses': '🎢'
    };
    return emojis[category] || '📋';
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
            // Initialize our custom AI agent
            const aiAgent = new CustomAIAgent();
            
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
            const sources = [];
            
            for (const url of websitesToScrape) {
                try {
                    const data = await scrapeWebsite(url);
                    if (data && data.content.length > 100) {
                        sources.push({
                            url: data.url,
                            title: data.title,
                            content: data.content,
                            domain: new URL(data.url).hostname.replace('www.', '')
                        });
                    }
                } catch (error) {
                    console.error(`Failed to scrape ${url}:`, error);
                }
            }
            
            // Use our custom AI agent to process the content
            const response = await aiAgent.processQuery(query, sources);
            
            return { data: { response } };
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
