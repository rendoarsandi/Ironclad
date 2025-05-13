'use server';
/**
 * @fileOverview A chatbot AI agent that can answer questions,
 * potentially using context from Supabase and maintaining user-specific chat history.
 *
 * - kontrakProChat - A function that handles the chat interaction.
 * - KontrakProChatFlowInput - The input type for the kontrakProChat function.
 * - KontrakProChatOutput - The return type for the kontrakProChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabase } from '@/lib/supabase';
import type {
  GenerateResponse,
  MessageData,
  Part,
} from 'genkit/ai';

// Type for Genkit chat messages (persistent storage format)
// Tool request/response inputs/outputs are stored as objects.
type GenkitChatMessage = MessageData;


// Define schema for the tool to get contract details
const ContractDetailsInputSchema = z.object({
  contractName: z.string().describe('The name of the contract to fetch details for.'),
});
const ContractDetailsOutputSchema = z.object({
  found: z.boolean().describe('Whether the contract was found.'),
  details: z.string().optional().describe('Details of the contract if found, or a "not found" message.'),
  status: z.string().optional().describe('The status of the contract.'),
  summary: z.string().optional().describe('A brief summary of the contract.'),
  uploadDate: z.string().optional().describe('The date the contract was uploaded.'),
});

// Tool implementation to fetch contract details from Supabase
const getContractDetailsByName = ai.defineTool(
  {
    name: 'getContractDetailsByName',
    description: 'Fetches details for a specific contract by its name from the KontrakPro Supabase database. Use this if the user asks about a specific contract.',
    inputSchema: ContractDetailsInputSchema,
    outputSchema: ContractDetailsOutputSchema,
  },
  async ({ contractName }) => {
    console.log(`Tool called: getContractDetailsByName for "${contractName}"`);

    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('title, status, content, id, created_at, type, version')
        .ilike('title', `%${contractName}%`)
        .limit(1)
        .single();

      if (error) {
        console.error('Supabase error fetching contract:', error);
        if (error.code === 'PGRST116') {
            return { found: false, details: `Contract named "${contractName}" not found.` };
        }
        return { found: false, details: `Error fetching contract "${contractName}": ${error.message}` };
      }

      if (!data) {
        return { found: false, details: `Contract named "${contractName}" not found.` };
      }

      const contractContentInfo = data.content ? `Content is available.` : `Content details are not directly available in this summary view.`;
      const responseDetails = `Details for ${data.title} (ID: ${data.id}): Status - ${data.status || 'N/A'}, Type - ${data.type || 'N/A'}, Version - ${data.version || 'N/A'}, Created - ${data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A'}. ${contractContentInfo}`;
      console.log("Tool response:", responseDetails);

      return {
        found: true,
        details: responseDetails,
        status: data.status,
        summary: data.content?.substring(0,100) || `${data.title} - ${data.type}`, // Provide content preview as summary
        uploadDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : undefined,
      };

    } catch (e: any) {
      console.error('Unexpected error in getContractDetailsByName tool:', e);
      return { found: false, details: `An unexpected error occurred while fetching details for "${contractName}".` };
    }
  }
);

// Schema for the input to the exported `kontrakProChat` function
const KontrakProChatFlowInputSchema = z.object({
  userId: z.string().describe('The ID of the user initiating the chat.'),
  userMessage: z.string().describe('The message from the user.'),
});
export type KontrakProChatFlowInput = z.infer<typeof KontrakProChatFlowInputSchema>;

// Schema for the output of the `kontrakProChat` function
const KontrakProChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response to the user's message."),
});
export type KontrakProChatOutput = z.infer<typeof KontrakProChatOutputSchema>;


// Schema for history parts passed to the LLM template.
// Tool request/response inputs/outputs are stringified for Handlebars.
const LlmTemplateHistoryPartSchema = z.object({
  text: z.string().optional(),
  toolRequest: z.object({ name: z.string(), input: z.string() }).optional(), // input is string
  toolResponse: z.object({ name: z.string(), output: z.string() }).optional(), // output is string
});

const LlmTemplateHistoryMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system', 'tool']),
  parts: z.array(LlmTemplateHistoryPartSchema),
  isUser: z.boolean().optional(),
  isModel: z.boolean().optional(),
  isTool: z.boolean().optional(),
});

// Schema for the complete input to the Genkit prompt (for type checking what Handlebars template receives).
const LlmInteractionSchema = z.object({
    userMessage: z.string().describe("The current user message to process."),
    history: z.array(LlmTemplateHistoryMessageSchema) // This history has stringified tool parts
      .optional()
      .describe('The history of the conversation so far. Use this to maintain context.'),
});


export async function kontrakProChat(input: KontrakProChatFlowInput): Promise<KontrakProChatOutput> {
  console.log('kontrakProChat input:', input); // Log the initial input
  return kontrakProChatFlow(input);
}

const TEN_MINUTES_MS = 10 * 60 * 1000;

async function fetchActiveHistory(userId: string): Promise<GenkitChatMessage[]> {
  const { data: session, error } = await supabase
    .from('chat_sessions')
    .select('history, last_updated_at')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error fetching chat history for user ${userId}:`, error);
    return [];
  }

  if (session) {
    const lastUpdated = new Date(session.last_updated_at).getTime();
    if (Date.now() - lastUpdated < TEN_MINUTES_MS) {
      const parsedHistory = (session.history || []) as GenkitChatMessage[];
      console.log("Fetched history from DB:", JSON.stringify(parsedHistory, null, 2));
      return parsedHistory;
    } else {
      console.log(`Chat history for user ${userId} is stale. Starting new session.`);
      await supabase.from('chat_sessions').delete().eq('user_id', userId);
      return [];
    }
  }
  console.log(`No active history found for user ${userId}. Starting new session.`);
  return [];
}

async function saveHistory(userId: string, history: GenkitChatMessage[]): Promise<void> {
  console.log("Persistent history BEFORE save to DB:", JSON.stringify(history, null, 2));
  const { error } = await supabase
    .from('chat_sessions')
    .upsert(
      {
        user_id: userId,
        history: history, // history should be GenkitChatMessage[] with object tool parts
        last_updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error(`Error saving chat history for user ${userId}:`, error);
  } else {
    console.log(`Chat history saved for user ${userId}. Length: ${history.length}`);
  }
}


const kontrakProChatPrompt = ai.definePrompt({
  name: 'kontrakProChatPrompt',
  input: { schema: LlmInteractionSchema }, // Expects history with stringified tool parts
  output: { schema: KontrakProChatOutputSchema },
  tools: [getContractDetailsByName],
  system: `You are KontrakPro AI, a friendly and helpful assistant for the KontrakPro contract lifecycle management application.
Answer the user's questions clearly and concisely.
PAY CLOSE ATTENTION to the provided chat history to understand the context of the conversation, recall previous statements, and provide relevant follow-up answers.
If the user asks about a specific contract, use the 'getContractDetailsByName' tool to fetch its details from the Supabase database.
When you decide to use the 'getContractDetailsByName' tool, you MUST inform the user you are looking up the information BEFORE the tool call, for example: "Let me check the details for [Contract Name]..." or "Okay, I'll look up [Contract Name] for you."
After the tool returns, incorporate its findings smoothly into your response.
If details are found, you might say, "Okay, I looked up '[ContractName]'. Here's what I found: [details]".
If it's not found, you could say, "I checked for '[ContractName]', but I couldn't find any details for it."
If the user asks a follow-up question that seems related to a previous contract discussion (based on the history), and the tool wasn't used in the immediate previous turn for that contract, consider using the tool again if the question implies needing specific, fresh details for that contract.
Do not make up information about contracts if the tool doesn't find them or if the information is not in the provided context.
Keep responses helpful and related to contract management. Be polite and professional.
If you are asked a question and the answer was clearly provided in a previous turn in the history, refer to it. For example: "As I mentioned earlier..." or "Previously, we discussed..."`,
  prompt: `{{#if history}}Chat History:
{{#each history}}
  {{#if isUser}}User: {{#each parts}}{{text}}{{/each}}{{/if}}
  {{#if isModel}}AI: {{#each parts}}{{text}}{{/each}}{{/if}}
  {{#if isTool}}
    {{#each parts}}
      {{#if toolRequest}}Tool Request: {{toolRequest.name}} arguments: {{{toolRequest.input}}}{{/if}}
      {{#if toolResponse}}Tool Response (for {{toolResponse.name}}): {{{toolResponse.output}}}{{/if}}
    {{/each}}
  {{/if}}
{{/each}}
{{/if}}

Current User Message:
User: {{{userMessage}}}
AI:`,
});

const kontrakProChatFlow = ai.defineFlow(
  {
    name: 'kontrakProChatFlow',
    inputSchema: KontrakProChatFlowInputSchema,
    outputSchema: KontrakProChatOutputSchema,
  },
  async (input) => {
    const { userId, userMessage } = input;

    console.log('kontrakProChatFlow started'); // Added log

    // 1. Fetch persistent history. This is GenkitChatMessage[] where tool parts are OBJECTS.
    let persistentHistory: GenkitChatMessage[] = await fetchActiveHistory(userId);
    console.log(`Fetched ${persistentHistory.length} messages from DB for user ${userId}`);

    // 2. Prepare history for LLM template consumption.
    //    This involves stringifying tool request/response inputs/outputs for Handlebars.
    const historyForLlmTemplate: z.infer<typeof LlmTemplateHistoryMessageSchema>[] = persistentHistory.map(msg => {
        const transformedParts: z.infer<typeof LlmTemplateHistoryPartSchema>[] = msg.parts.map(part => {
            if ('text' in part) {
                return { text: part.text };
            } else if ('toolRequest' in part) {
                return {
                    toolRequest: {
                        name: part.toolRequest.name,
                        input: JSON.stringify(part.toolRequest.input) // Stringify for template
                    }
                };
            } else if ('toolResponse' in part) {
                return {
                    toolResponse: {
                        name: part.toolResponse.name,
                        output: JSON.stringify(part.toolResponse.output) // Stringify for template
                    }
                };
            }
            return {}; // Should not happen with valid GenkitChatMessage
        }).filter(p => Object.keys(p).length > 0);

        return {
            role: msg.role,
            parts: transformedParts,
            isUser: msg.role === 'user',
            isModel: msg.role === 'model',
            isTool: msg.role === 'tool',
        };
    });

    const llmInputForPrompt: z.infer<typeof LlmInteractionSchema> = {
        userMessage: userMessage,
        history: historyForLlmTemplate,
    };

    console.log("History passed to LLM template:", JSON.stringify(llmInputForPrompt.history, null, 2));

    // 3. Call the LLM prompt
    // llmResponse.history contains the history *as processed by the prompt and sent to the model*
    // plus the model's new responses. Critically, the model's new tool_request/tool_response parts in
    // llmResponse.history should be OBJECTS as per Genkit's internal MessageData.
    const llmResponse: GenerateResponse<z.infer<typeof KontrakProChatOutputSchema>> = await kontrakProChatPrompt(llmInputForPrompt);

    // 4. Extract AI response text
    const aiResponseMessage = llmResponse.output?.aiResponse || llmResponse.text || "I'm sorry, I couldn't process that request at the moment.";

    // 5. Update persistentHistory (which has object tool parts)
    //    a. Add the current user message (as GenkitChatMessage)
    persistentHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    //    b. Add the new messages generated by the model in *this* turn.
    //       These messages should come from llmResponse.history.
    //       llmResponse.history contains: [rendered_history_for_template, rendered_user_message, ...model_generated_messages]
    //       The `model_generated_messages` part should have tool inputs/outputs as objects.
    if (llmResponse.history) {
        // `historyForLlmTemplate.length` is the number of messages from previous turns.
        // The prompt template effectively adds the `userMessage` after this history.
        // So, new messages from the model start at index `historyForLlmTemplate.length + 1`.
        const modelGeneratedMessagesStartIndex = historyForLlmTemplate.length + 1;

        if (llmResponse.history.length >= modelGeneratedMessagesStartIndex) {
            const newModelMessages = llmResponse.history.slice(modelGeneratedMessagesStartIndex);
            persistentHistory.push(...newModelMessages.filter(Boolean).map(m => m as GenkitChatMessage));
            console.log(`Added ${newModelMessages.length} new model messages to persistent history.`);
        }  else {
             // This case means llmResponse.history might not be structured as expected (e.g., only contains final response)
             // Or if it's a simple text response without tool usage.
            console.warn("llmResponse.history was shorter than expected or missing model generated parts. Attempting to add final candidate message.");
            if (llmResponse.candidates?.[0]?.message) {
                persistentHistory.push(llmResponse.candidates[0].message as GenkitChatMessage);
                 console.log("Added final candidate message to persistent history.");
            } else if (aiResponseMessage && (!llmResponse.candidates || llmResponse.candidates.length === 0)) {
                 // Fallback if only raw text and no candidate
                 persistentHistory.push({ role: 'model', parts: [{ text: aiResponseMessage }] });
                 console.log("Added raw AI response text as a model message to persistent history.");
            }
        }
    } else if (llmResponse.candidates?.[0]?.message) {
        // If llmResponse.history is empty/null, but we have a candidate.
        persistentHistory.push(llmResponse.candidates[0].message as GenkitChatMessage);
        console.log("llmResponse.history was empty, added final candidate message to persistent history.");
    } else if (aiResponseMessage) {
        // Last resort if only text available.
        persistentHistory.push({ role: 'model', parts: [{ text: aiResponseMessage }] });
        console.log("llmResponse.history and candidates were empty, added raw AI response text to persistent history.");
    }

    // 6. Save updated persistent history (tool parts must be objects here)
    await saveHistory(userId, persistentHistory);

    return { aiResponse: aiResponseMessage };
  }
);
