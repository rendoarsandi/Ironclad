
import { config } from 'dotenv';
config();

import '@/ai/flows/contract-summarization.ts';
import '@/ai/flows/chatbot-flow.ts';
import '@/ai/flows/risk-detection-flow.ts';
import '@/ai/flows/clause-extraction-flow.ts';
import '@/ai/flows/hello-example-flow'; // Import the new example flow

// To explicitly test the helloFlow, you could also do:
// import { runHelloExampleFlow } from '@/ai/flows/hello-example-flow';
// (async () => {
//   try {
//     const greeting = await runHelloExampleFlow({ name: 'Dev Test' });
//     console.log('Explicit call from dev.ts:', greeting);
//   } catch (e) {
//     console.error('Error calling runHelloExampleFlow from dev.ts', e);
//   }
// })();
