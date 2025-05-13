'use server';
/**
 * @fileOverview A simple Genkit flow example provided by the user.
 *
 * - runHelloExampleFlow - A function to call the helloExampleGenkitFlow.
 */

// import the Genkit and Google AI plugin libraries
import { googleAI, type Gemini } from '@genkit-ai/googleai'; // Correct import for Gemini type
import { genkit } from 'genkit';
import { z } from 'zod'; // Zod is good practice, though not strictly used in the simplest form of user's request

// configure a Genkit instance (local to this file, as per user request)
// Note: Typically, a single 'ai' instance is defined in src/ai/genkit.ts and imported.
// This local instance is created to match the user's provided code snippet.
const localAiInstance = genkit({
  plugins: [googleAI()],
  // 'gemini15Flash' is not a direct import object; the model identifier string should be used.
  // The user requested 'gemini15Flash', which typically refers to 'gemini-1.5-flash'.
  model: 'googleai/gemini-1.5-flash' as Gemini, // Set default model
});

// Define input schema (good practice, even for simple inputs)
export const HelloExampleFlowInputSchema = z.object({
  name: z.string().describe("The name to greet."),
});
export type HelloExampleFlowInput = z.infer<typeof HelloExampleFlowInputSchema>;

// Define output schema (good practice)
export const HelloExampleFlowOutputSchema = z.object({
  greeting: z.string().describe("The generated greeting."),
});
export type HelloExampleFlowOutput = z.infer<typeof HelloExampleFlowOutputSchema>;


// Define the Genkit flow
const helloExampleGenkitFlow = localAiInstance.defineFlow(
  {
    name: 'helloExampleFlow', // Name for Genkit's registry
    inputSchema: HelloExampleFlowInputSchema,
    outputSchema: HelloExampleFlowOutputSchema,
  },
  async (input: HelloExampleFlowInput) => {
    // make a generation request using the local AI instance
    const response = await localAiInstance.generate({
      prompt: `Hello Gemini, my name is ${input.name}`
      // Model is taken from localAiInstance default
    });
    const textContent = response.text; // Use response.text for Genkit v1.x
    console.log(`Generated text by helloExampleGenkitFlow for ${input.name}:`, textContent);
    return { greeting: textContent! };
  }
);

// Exported wrapper function to call the flow, adhering to standard pattern
export async function runHelloExampleFlow(input: HelloExampleFlowInput): Promise<HelloExampleFlowOutput> {
  try {
    const result = await helloExampleGenkitFlow(input);
    return result;
  } catch (error) {
    console.error(`Error in runHelloExampleFlow for ${input.name}:`, error);
    // Re-throw or return a specific error structure
    throw error;
  }
}

// The user's original code called the flow directly like helloFlow('Chris');
// To make this executable upon import (as implied by the user's snippet for quick testing),
// we can wrap it in an async IIFE (Immediately Invoked Function Expression).
// This will run when this module is imported, e.g., by src/ai/dev.ts.
(async () => {
  // This check ensures the direct call only happens in a development-like environment,
  // not in every context where this module might be imported (e.g., by Next.js build).
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      console.log("Running helloExampleFlow({ name: 'Chris' }) from hello-example-flow.ts upon import (dev mode)...");
      const result = await runHelloExampleFlow({ name: 'Chris' });
      console.log("Direct call output from hello-example-flow.ts:", result.greeting);
    } catch (e) {
      console.error("Error during direct call in hello-example-flow.ts:", e);
    }
  }
})();
