import { config } from 'dotenv';
config();

import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/analyze-content.ts';
import '@/ai/flows/generate-quizzes.ts';