'use server';

/**
 * @fileOverview Advanced YouTube video analysis with comprehensive features
 * 
 * Features:
 * - Video transcript extraction and analysis
 * - Key moments identification
 * - Summary generation
 * - Q&A about video content
 * - Topic extraction
 * - Sentiment analysis
 * - Educational content structuring
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { getYoutubeTranscript } from './youtube-transcript';
import { openai as sambaClient } from "@/lib/openai";

const AdvancedYoutubeAnalysisInputSchema = z.object({
  videoUrl: z.string().describe('YouTube video URL or video ID'),
  analysisType: z.enum(['comprehensive', 'summary', 'qa', 'educational', 'sentiment']).describe('Type of analysis to perform'),
  specificQuestions: z.array(z.string()).optional().describe('Specific questions to answer about the video'),
  language: z.string().default('en').describe('Language for the analysis'),
});

export type AdvancedYoutubeAnalysisInput = z.infer<typeof AdvancedYoutubeAnalysisInputSchema>;

const AdvancedYoutubeAnalysisOutputSchema = z.object({
  videoId: z.string(),
  title: z.string().optional(),
  summary: z.string().describe('Comprehensive summary of the video'),
  keyMoments: z.array(z.object({
    timestamp: z.string(),
    description: z.string(),
    importance: z.enum(['high', 'medium', 'low'])
  })).describe('Key moments in the video with timestamps'),
  topics: z.array(z.string()).describe('Main topics covered in the video'),
  sentiment: z.object({
    overall: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1),
    emotions: z.array(z.string())
  }).describe('Sentiment analysis of the video'),
  educationalStructure: z.object({
    learningObjectives: z.array(z.string()),
    prerequisites: z.array(z.string()),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    concepts: z.array(z.object({
      concept: z.string(),
      explanation: z.string(),
      timestamp: z.string().optional()
    }))
  }).optional().describe('Educational structure if the video is educational'),
  qaResults: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    confidence: z.number().min(0).max(1),
    relevantTimestamps: z.array(z.string()).optional()
  })).optional().describe('Q&A results if specific questions were asked'),
  transcript: z.string().optional().describe('Full transcript of the video'),
  recommendations: z.array(z.string()).describe('Recommendations for further learning or related content')
});

export type AdvancedYoutubeAnalysisOutput = z.infer<typeof AdvancedYoutubeAnalysisOutputSchema>;

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  throw new Error('Invalid YouTube URL or video ID');
}

const analysisPrompts = {
  comprehensive: `Analyze this YouTube video transcript comprehensively. Provide:
1. A detailed summary covering all main points
2. Key moments with timestamps and importance levels
3. Main topics and themes
4. Sentiment analysis with emotions detected
5. Educational structure if applicable (learning objectives, prerequisites, difficulty, key concepts)
6. Recommendations for further learning

Transcript: {{transcript}}

Respond in valid JSON format matching the schema.`,

  summary: `Create a comprehensive summary of this YouTube video transcript. Focus on:
- Main points and key takeaways
- Important insights and conclusions
- Overall message and purpose

Transcript: {{transcript}}`,

  qa: `Answer the following questions about this YouTube video based on the transcript:
Questions: {{questions}}

Transcript: {{transcript}}

For each question, provide:
- A detailed answer
- Confidence level (0-1)
- Relevant timestamps if applicable`,

  educational: `Analyze this educational YouTube video and structure it for learning:
1. Identify learning objectives
2. List prerequisites
3. Determine difficulty level
4. Extract key concepts with explanations
5. Map concepts to timestamps where possible

Transcript: {{transcript}}`,

  sentiment: `Perform sentiment analysis on this YouTube video transcript:
1. Overall sentiment (positive/negative/neutral)
2. Confidence level
3. Specific emotions detected
4. Tone and mood throughout the video

Transcript: {{transcript}}`
};

export const advancedYoutubeAnalysis = ai.defineFlow(
  {
    name: 'advancedYoutubeAnalysis',
    inputSchema: AdvancedYoutubeAnalysisInputSchema,
    outputSchema: AdvancedYoutubeAnalysisOutputSchema,
  },
  async (input) => {
    try {
      // Extract video ID
      const videoId = extractVideoId(input.videoUrl);
      
      // Get transcript
      const transcriptResult = await getYoutubeTranscript({ videoId });
      
      if (!transcriptResult.transcript) {
        throw new Error('Could not retrieve transcript for this video');
      }

      const transcript = transcriptResult.transcript;
      
      // Prepare analysis prompt based on type
      let prompt = analysisPrompts[input.analysisType];
      prompt = prompt.replace('{{transcript}}', transcript);
      
      if (input.analysisType === 'qa' && input.specificQuestions) {
        prompt = prompt.replace('{{questions}}', input.specificQuestions.join('\n'));
      }

      // For comprehensive analysis, use structured JSON response
      if (input.analysisType === 'comprehensive') {
        const response = await sambaClient.chat.completions.create({
          model: 'gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'You are an expert video analyst. Analyze YouTube videos comprehensively and respond in valid JSON format.'
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        if (!response.choices?.[0]?.message?.content) {
          throw new Error('No response from AI model');
        }

        const analysisResult = JSON.parse(response.choices[0].message.content);
        
        return {
          videoId,
          title: transcriptResult.title,
          transcript,
          ...analysisResult
        };
      }

      // For other analysis types, generate specific responses
      const response = await sambaClient.chat.completions.create({
        model: 'Meta-Llama-3.1-8B-Instruct',
        messages: [
          {
            role: 'system',
            content: `You are SearnAI, an expert video analyst. Provide detailed, structured analysis of YouTube videos.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('No response from AI model');
      }

      const analysisText = response.choices[0].message.content;

      // Create a basic structure for non-comprehensive analysis
      const basicResult: AdvancedYoutubeAnalysisOutput = {
        videoId,
        title: transcriptResult.title,
        summary: analysisText,
        keyMoments: [],
        topics: [],
        sentiment: {
          overall: 'neutral',
          confidence: 0.5,
          emotions: []
        },
        recommendations: [],
        transcript: input.analysisType === 'summary' ? undefined : transcript
      };

      // Add specific results based on analysis type
      if (input.analysisType === 'qa' && input.specificQuestions) {
        basicResult.qaResults = input.specificQuestions.map((question, index) => ({
          question,
          answer: analysisText,
          confidence: 0.8,
          relevantTimestamps: []
        }));
      }

      return basicResult;

    } catch (error: any) {
      console.error('Advanced YouTube Analysis Error:', error);
      throw new Error(`Failed to analyze video: ${error.message}`);
    }
  }
);