
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure GOOGLE_GENAI_API_KEY is set in your .env.local file
// The googleAI() plugin will automatically use it.

export const ai = genkit({
  plugins: [googleAI()], // This will use GOOGLE_GENAI_API_KEY from .env.local
  model: 'googleai/gemini-1.5-flash', // Using Gemini 1.5 Flash as requested
});

