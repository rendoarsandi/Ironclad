
'use server';
/**
 * @fileOverview An AI agent to extract specific clauses from a contract.
 *
 * - extractContractClauses - A function that handles the clause extraction process.
 * - ExtractContractClausesInput - The input type for the function.
 * - ExtractContractClausesOutput - The return type for the function.
 *
 * - extractClauses - A client-side function for the UI components
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v4 as uuidv4 } from 'uuid';
import { Clause } from '@/components/ai/clause-extraction';

const ExtractContractClausesInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      "A contract document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  clausesToExtract: z.array(z.string()).min(1).describe("An array of clause types or keywords to extract (e.g., ['Indemnification', 'Limitation of Liability', 'Governing Law'])."),
});
export type ExtractContractClausesInput = z.infer<typeof ExtractContractClausesInputSchema>;

const ExtractedClauseSchema = z.object({
  clauseType: z.string().describe("The type of clause that was extracted (e.g., 'Indemnification')."),
  extractedText: z.string().describe("The full text of the extracted clause."),
  pageReference: z.string().optional().describe("The page number or section where the clause was found, if available."),
});

const ExtractContractClausesOutputSchema = z.object({
  extractedClauses: z.array(ExtractedClauseSchema).describe("A list of extracted clauses and their text."),
  summaryMessage: z.string().describe("A summary message about the extraction process (e.g., number of clauses found).")
});
export type ExtractContractClausesOutput = z.infer<typeof ExtractContractClausesOutputSchema>;

export async function extractContractClauses(input: ExtractContractClausesInput): Promise<ExtractContractClausesOutput> {
  return extractContractClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContractClausesPrompt',
  input: { schema: ExtractContractClausesInputSchema },
  output: { schema: ExtractContractClausesOutputSchema },
  prompt: `You are an expert legal AI specializing in extracting specific clauses from legal contracts.
Analyze the following contract document carefully. Extract the full text for each of the specified clause types.

Contract Document:
{{media url=contractDataUri}}

Clause Types to Extract:
{{#each clausesToExtract}}
- {{{this}}}
{{/each}}

For each extracted clause, provide its type and the full text. If possible, indicate where it was found.
If a specified clause type is not found, indicate that.
Return a list of extracted clauses.
`,
});

const extractContractClausesFlow = ai.defineFlow(
  {
    name: 'extractContractClausesFlow',
    inputSchema: ExtractContractClausesInputSchema,
    outputSchema: ExtractContractClausesOutputSchema,
  },
  async (input) => {
    // Placeholder for actual clause extraction logic
    // const { output } = await prompt(input);
    // return output!;

    // For now, returning a placeholder as the feature is in development
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing
    return {
      extractedClauses: input.clausesToExtract.map(clauseType => ({
        clauseType: clauseType,
        extractedText: `Full text for "${clauseType}" would appear here. This feature is currently under development.`,
        pageReference: "N/A",
      })),
      summaryMessage: `Clause extraction feature is under development. AI will soon be able to extract the requested clauses. Attempted to find: ${input.clausesToExtract.join(', ')}.`,
    };
  }
);

// Client-side interface for UI components

export interface ClauseExtractionFlowInput {
  documentUrl: string;
  documentName: string;
}

export interface ClauseExtractionFlowOutput {
  clauses: Clause[];
}

// Mock data for clause extraction
const mockClauses: Clause[] = [
  {
    id: uuidv4(),
    title: "Pembatasan Tanggung Jawab",
    content: "Dalam keadaan apapun, tanggung jawab Penyedia Layanan tidak akan melebihi jumlah total yang dibayarkan oleh Klien kepada Penyedia Layanan selama 12 bulan sebelum klaim tersebut timbul.",
    category: "Tanggung Jawab",
    importance: "high",
  },
  {
    id: uuidv4(),
    title: "Kerahasiaan",
    content: "Masing-masing pihak setuju untuk menjaga kerahasiaan semua informasi rahasia yang diterima dari pihak lain dan tidak akan mengungkapkan informasi tersebut kepada pihak ketiga tanpa persetujuan tertulis sebelumnya.",
    category: "Kerahasiaan",
    importance: "high",
  },
  {
    id: uuidv4(),
    title: "Pengakhiran Perjanjian",
    content: "Perjanjian ini dapat diakhiri oleh salah satu pihak dengan memberikan pemberitahuan tertulis 30 hari sebelumnya. Setelah pengakhiran, Klien harus membayar semua biaya yang terutang hingga tanggal pengakhiran.",
    category: "Pengakhiran",
    importance: "medium",
  },
  {
    id: uuidv4(),
    title: "Hak Kekayaan Intelektual",
    content: "Semua hak kekayaan intelektual yang ada sebelum perjanjian ini tetap menjadi milik pihak masing-masing. Hak kekayaan intelektual yang dikembangkan selama perjanjian ini akan menjadi milik Penyedia Layanan kecuali disepakati lain secara tertulis.",
    category: "Kekayaan Intelektual",
    importance: "high",
  },
  {
    id: uuidv4(),
    title: "Pembayaran",
    content: "Klien harus membayar semua faktur dalam waktu 30 hari sejak tanggal faktur. Keterlambatan pembayaran akan dikenakan bunga sebesar 1.5% per bulan.",
    category: "Pembayaran",
    importance: "medium",
  },
  {
    id: uuidv4(),
    title: "Force Majeure",
    content: "Tidak ada pihak yang bertanggung jawab atas kegagalan atau keterlambatan dalam pelaksanaan yang disebabkan oleh keadaan di luar kendali yang wajar, termasuk namun tidak terbatas pada bencana alam, perang, terorisme, kerusuhan, embargo, tindakan otoritas sipil atau militer, kebakaran, banjir, kecelakaan, pemogokan, atau kekurangan transportasi, bahan bakar, energi, tenaga kerja atau material.",
    category: "Force Majeure",
    importance: "low",
  },
  {
    id: uuidv4(),
    title: "Hukum yang Berlaku",
    content: "Perjanjian ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap perselisihan yang timbul dari atau sehubungan dengan perjanjian ini akan diselesaikan melalui arbitrase di Jakarta sesuai dengan peraturan Badan Arbitrase Nasional Indonesia (BANI).",
    category: "Hukum",
    importance: "medium",
  },
];

/**
 * Extract clauses from a document
 * In a real implementation, this would call an AI service
 */
export async function extractClauses(input: ClauseExtractionFlowInput): Promise<ClauseExtractionFlowOutput> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real implementation, you would:
  // 1. Download the document from the URL
  // 2. Extract text from the document
  // 3. Use AI to identify and extract clauses
  // 4. Categorize and rate the importance of each clause

  // For now, return mock data
  return {
    clauses: mockClauses,
  };
}
