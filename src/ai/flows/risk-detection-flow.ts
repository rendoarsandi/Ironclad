
'use server';
/**
 * @fileOverview An AI agent to detect risks in a contract.
 *
 * - detectContractRisks - A function that handles the contract risk detection process.
 * - DetectContractRisksInput - The input type for the detectContractRisks function.
 * - DetectContractRisksOutput - The return type for the detectContractRisks function.
 *
 * - detectRisks - A client-side function for the UI components
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v4 as uuidv4 } from 'uuid';
import { Risk } from '@/components/ai/risk-detection';

const DetectContractRisksInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      "A contract document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectContractRisksInput = z.infer<typeof DetectContractRisksInputSchema>;

const DetectContractRisksOutputSchema = z.object({
  riskAnalysis: z.string().describe('A textual analysis of potential risks found in the contract.'),
  // For a more detailed output, you could use:
  // identifiedRisks: z.array(z.object({
  //   riskType: z.string().describe("The category of the risk (e.g., Financial, Legal, Operational)."),
  //   description: z.string().describe("A description of the identified risk."),
  //   severity: z.enum(['Low', 'Medium', 'High']).describe("The severity level of the risk."),
  //   clauseReference: z.string().optional().describe("Reference to the clause in the contract related to this risk."),
  // })).describe("A list of identified risks."),
  // overallRiskLevel: z.enum(['Low', 'Medium', 'High', 'N/A']).describe("An overall assessment of the contract's risk level."),
});
export type DetectContractRisksOutput = z.infer<typeof DetectContractRisksOutputSchema>;

export async function detectContractRisks(input: DetectContractRisksInput): Promise<DetectContractRisksOutput> {
  return detectContractRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectContractRisksPrompt',
  input: { schema: DetectContractRisksInputSchema },
  output: { schema: DetectContractRisksOutputSchema },
  prompt: `You are an expert legal AI specializing in identifying and assessing risks in legal contracts.
Analyze the following contract document carefully. Identify potential risks, ambiguities, unfavorable terms, and any clauses that might pose a problem.
Provide a comprehensive risk analysis.

Contract Document:
{{media url=contractDataUri}}

Respond with a textual analysis of the risks. If you identify specific risks, list them clearly.
If the contract appears low-risk, state that as well.`,
});

const detectContractRisksFlow = ai.defineFlow(
  {
    name: 'detectContractRisksFlow',
    inputSchema: DetectContractRisksInputSchema,
    outputSchema: DetectContractRisksOutputSchema,
  },
  async (input) => {
    // Placeholder for actual risk detection logic
    // const { output } = await prompt(input);
    // return output!;

    // For now, returning a placeholder as the feature is in development
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing
    return {
      riskAnalysis: "Risk detection feature is currently under development. Advanced AI analysis will be available soon to identify potential risks in your contract. For now, please manually review your contract for risks.",
    };
  }
);

// Client-side interface for UI components

export interface RiskDetectionFlowInput {
  documentUrl: string;
  documentName: string;
}

export interface RiskDetectionFlowOutput {
  risks: Risk[];
  riskScore: number;
}

// Mock data for risk detection
const mockRisks: Risk[] = [
  {
    id: uuidv4(),
    title: "Pembatasan Tanggung Jawab Tidak Jelas",
    description: "Klausul pembatasan tanggung jawab tidak menentukan dengan jelas batasan moneter atau jenis kerugian yang dikecualikan.",
    severity: "high",
    category: "Tanggung Jawab",
    location: "Halaman 3, Paragraf 2",
    recommendation: "Tentukan batas moneter yang spesifik untuk tanggung jawab dan daftar jenis kerugian yang dikecualikan (misalnya kerugian tidak langsung, kehilangan keuntungan, dll)."
  },
  {
    id: uuidv4(),
    title: "Ketentuan Pengakhiran Sepihak",
    description: "Perjanjian memungkinkan salah satu pihak untuk mengakhiri kontrak tanpa alasan dengan pemberitahuan singkat.",
    severity: "medium",
    category: "Pengakhiran",
    location: "Halaman 5, Bagian 7.2",
    recommendation: "Pertimbangkan untuk menambahkan persyaratan pemberitahuan yang lebih lama atau batasan pada pengakhiran tanpa alasan untuk memberikan perlindungan yang lebih baik."
  },
  {
    id: uuidv4(),
    title: "Kewajiban Kerahasiaan Tidak Seimbang",
    description: "Kewajiban kerahasiaan hanya berlaku untuk satu pihak, tidak timbal balik.",
    severity: "high",
    category: "Kerahasiaan",
    location: "Halaman 4, Bagian 6",
    recommendation: "Ubah klausul kerahasiaan agar berlaku untuk kedua belah pihak secara setara."
  },
  {
    id: uuidv4(),
    title: "Tidak Ada Klausul Force Majeure",
    description: "Perjanjian tidak memiliki klausul force majeure yang melindungi para pihak dari peristiwa di luar kendali mereka.",
    severity: "medium",
    category: "Force Majeure",
    location: "Tidak ada",
    recommendation: "Tambahkan klausul force majeure yang komprehensif yang mencakup peristiwa seperti bencana alam, pandemi, dan gangguan bisnis yang signifikan."
  },
  {
    id: uuidv4(),
    title: "Ketentuan Pembayaran Tidak Jelas",
    description: "Jadwal pembayaran dan konsekuensi keterlambatan pembayaran tidak ditentukan dengan jelas.",
    severity: "medium",
    category: "Pembayaran",
    location: "Halaman 2, Bagian 3",
    recommendation: "Tentukan jadwal pembayaran yang jelas, termasuk tanggal jatuh tempo, metode pembayaran, dan konsekuensi keterlambatan (seperti bunga atau penalti)."
  },
  {
    id: uuidv4(),
    title: "Hak Kekayaan Intelektual Tidak Jelas",
    description: "Kepemilikan kekayaan intelektual yang dikembangkan selama perjanjian tidak ditentukan dengan jelas.",
    severity: "high",
    category: "Kekayaan Intelektual",
    location: "Halaman 6, Bagian 9",
    recommendation: "Tentukan dengan jelas kepemilikan semua kekayaan intelektual yang ada sebelumnya dan yang baru dikembangkan."
  },
  {
    id: uuidv4(),
    title: "Tidak Ada Klausul Penyelesaian Sengketa",
    description: "Perjanjian tidak menentukan mekanisme penyelesaian sengketa atau yurisdiksi yang berlaku.",
    severity: "low",
    category: "Penyelesaian Sengketa",
    location: "Tidak ada",
    recommendation: "Tambahkan klausul yang menentukan mekanisme penyelesaian sengketa (mediasi, arbitrase, atau litigasi) dan yurisdiksi yang berlaku."
  }
];

/**
 * Detect risks in a document
 * In a real implementation, this would call an AI service
 */
export async function detectRisks(input: RiskDetectionFlowInput): Promise<RiskDetectionFlowOutput> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real implementation, you would:
  // 1. Download the document from the URL
  // 2. Extract text from the document
  // 3. Use AI to identify and analyze risks
  // 4. Calculate a risk score based on the severity and number of risks

  // Calculate mock risk score (0-100)
  const highRisks = mockRisks.filter(risk => risk.severity === "high").length;
  const mediumRisks = mockRisks.filter(risk => risk.severity === "medium").length;
  const lowRisks = mockRisks.filter(risk => risk.severity === "low").length;

  const riskScore = Math.min(
    100,
    Math.round((highRisks * 25 + mediumRisks * 10 + lowRisks * 5) * (100 / 30))
  );

  // For now, return mock data
  return {
    risks: mockRisks,
    riskScore,
  };
}
