import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

import { createAllTables } from './create-tables';

/**
 * Create necessary tables in Supabase if they don't exist
 */
export async function createTablesIfNotExist() {
  try {
    console.log("Checking and creating necessary tables...");

    // Try to create all tables directly with SQL
    const result = await createAllTables();

    if (result.success) {
      console.log("All tables created successfully");
    } else {
      console.error("Error creating tables:", result.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating tables:", JSON.stringify(error));
    return { success: false, error };
  }
}

// Mock data for contracts
const mockContracts = [
  {
    title: "Master Service Agreement",
    type: "contract",
    status: "active",
    content: "This Master Service Agreement (MSA) outlines the terms and conditions for services provided by Party A to Party B, covering scope, payment, confidentiality, and termination clauses. It is effective from November 15, 2023.",
    version: 2,
    metadata: {
      file_url: "https://example.com/contracts/msa.pdf",
      file_name: "msa.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 2, // 2MB
      tags: ["agreement", "service", "master"],
    }
  },
  {
    title: "Non-Disclosure Agreement",
    type: "contract",
    status: "pending_review",
    content: "This Non-Disclosure Agreement (NDA) is entered into by and between the parties to protect confidential information shared during business discussions.",
    version: 1,
    metadata: {
      file_url: "https://example.com/contracts/nda.pdf",
      file_name: "nda.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 1.5, // 1.5MB
      tags: ["confidentiality", "nda", "legal"],
    }
  },
  {
    title: "Employment Contract",
    type: "contract",
    status: "draft",
    content: "This Employment Contract outlines the terms and conditions of employment between the Company and the Employee.",
    version: 1,
    metadata: {
      file_url: "https://example.com/contracts/employment.pdf",
      file_name: "employment.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 1.8, // 1.8MB
      tags: ["employment", "hr", "contract"],
    }
  },
  {
    title: "Software License Agreement",
    type: "contract",
    status: "active",
    content: "This Software License Agreement grants the licensee the right to use the software under specific terms and conditions.",
    version: 3,
    metadata: {
      file_url: "https://example.com/contracts/license.pdf",
      file_name: "license.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 2.2, // 2.2MB
      tags: ["software", "license", "agreement"],
    }
  },
  {
    title: "Consulting Agreement",
    type: "contract",
    status: "expired",
    content: "This Consulting Agreement outlines the terms under which consulting services will be provided.",
    version: 1,
    metadata: {
      file_url: "https://example.com/contracts/consulting.pdf",
      file_name: "consulting.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 1.7, // 1.7MB
      tags: ["consulting", "services", "agreement"],
    }
  }
];

// Mock data for signatures
const mockSignatures = [
  {
    signature_image_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg==",
    signed_at: new Date().toISOString(),
    ip_address: "127.0.0.1",
    metadata: { browser: "Mozilla/5.0" }
  }
];

// Mock data for chat sessions
const mockChatSessions = [
  {
    title: "Contract Review Discussion",
    last_message_at: new Date().toISOString(),
    status: "active"
  },
  {
    title: "NDA Clarification",
    last_message_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "active"
  }
];

// Mock data for chat messages
const mockChatMessages = [
  {
    content: "Can you help me review this contract?",
    role: "user",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
  },
  {
    content: "Of course! I'd be happy to help you review the contract. Please upload the document or provide specific sections you'd like me to analyze.",
    role: "assistant",
    created_at: new Date(Date.now() - 29 * 60 * 1000).toISOString() // 29 minutes ago
  },
  {
    content: "I'm particularly concerned about the liability clauses in section 8.",
    role: "user",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() // 25 minutes ago
  },
  {
    content: "Let me analyze the liability clauses in section 8 for you. These clauses typically define the extent to which each party can be held responsible for damages or losses. I'll look for any potentially problematic language or unfavorable terms.",
    role: "assistant",
    created_at: new Date(Date.now() - 24 * 60 * 1000).toISOString() // 24 minutes ago
  }
];

/**
 * Store mock data for a specific user
 * @param userId The user ID to store data for
 * @param organizationId The organization ID to associate data with
 */
export async function storeMockDataForUser(userId: string, organizationId: string) {
  try {
    console.log("Storing mock data for user:", userId);

    // Check if contracts table exists
    const { error: contractsCountError } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true });

    if (!contractsCountError) {
      // Store mock contracts
      for (const contract of mockContracts) {
        const { error: contractError } = await supabase
          .from('contracts')
          .insert({
            ...contract,
            created_by: userId,
            organization_id: organizationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (contractError) {
          console.error("Error storing mock contract:", JSON.stringify(contractError));
        }
      }
    } else {
      console.log("Contracts table doesn't exist, skipping mock contracts");
    }

    // Check if signatures table exists
    const { error: signaturesCountError } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true });

    if (!signaturesCountError) {
      // Store mock signatures
      for (const signature of mockSignatures) {
        const { error: signatureError } = await supabase
          .from('signatures')
          .insert({
            ...signature,
            user_id: userId,
          });

        if (signatureError) {
          console.error("Error storing mock signature:", JSON.stringify(signatureError));
        }
      }
    } else {
      console.log("Signatures table doesn't exist, skipping mock signatures");
    }

    // Check if chat_sessions table exists
    const { error: sessionsCountError } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    if (!sessionsCountError) {
      // Store mock chat sessions and messages
      for (const session of mockChatSessions) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            ...session,
            user_id: userId,
            organization_id: organizationId,
          })
          .select()
          .single();

        if (sessionError) {
          console.error("Error storing mock chat session:", JSON.stringify(sessionError));
          continue;
        }

        // Check if chat_messages table exists
        const { error: messagesCountError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true });

        if (!messagesCountError && sessionData) {
          // Store mock messages for this session
          for (const message of mockChatMessages) {
            const { error: messageError } = await supabase
              .from('chat_messages')
              .insert({
                ...message,
                session_id: sessionData.id,
                user_id: userId,
              });

            if (messageError) {
              console.error("Error storing mock chat message:", JSON.stringify(messageError));
            }
          }
        } else {
          console.log("Chat messages table doesn't exist, skipping mock messages");
        }
      }
    } else {
      console.log("Chat sessions table doesn't exist, skipping mock sessions and messages");
    }

    console.log("Mock data stored successfully for user:", userId);
    return { success: true };
  } catch (error) {
    console.error("Error storing mock data:", JSON.stringify(error));
    return { success: false, error };
  }
}

/**
 * Check if a user already has data
 * @param userId The user ID to check
 */
export async function userHasData(userId: string): Promise<boolean> {
  try {
    // Try to check if contracts table exists and if user has any contracts
    try {
      const { count, error } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);

      if (!error && count !== null && count > 0) {
        return true;
      }
    } catch (e) {
      console.log("Contracts table may not exist:", e);
    }

    // Try to check if signatures table exists and if user has any signatures
    try {
      const { count, error } = await supabase
        .from('signatures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!error && count !== null && count > 0) {
        return true;
      }
    } catch (e) {
      console.log("Signatures table may not exist:", e);
    }

    // Try to check if chat_sessions table exists and if user has any chat sessions
    try {
      const { count, error } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!error && count !== null && count > 0) {
        return true;
      }
    } catch (e) {
      console.log("Chat sessions table may not exist:", e);
    }

    // If we get here, user doesn't have any data or tables don't exist
    return false;
  } catch (error) {
    console.error("Error checking if user has data:", JSON.stringify(error));
    return false;
  }
}
