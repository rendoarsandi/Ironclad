
// Mock User Role
export type UserRole = 'admin' | 'user';

// Organization interface
export interface Organization {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

// User Role within Organization
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';

// Mock User Object - adjusted for potential Supabase user_metadata
export interface User {
  id: string;
  email: string;
  name?: string; // Often from user_metadata.full_name or user_metadata.name
  avatarUrl?: string; // Often from user_metadata.avatar_url
  role: UserRole;
  organization_id?: string;
  organization_name?: string;
  organization_role?: OrganizationRole;
}

// Contract Status
export type ContractStatus = 'draft' | 'pending_review' | 'active' | 'archived' | 'rejected';

// Structured Summary for AI insights
export interface StructuredSummary {
  overallSummary: string;
  keyClauses?: Array<{ title: string; text: string; riskLevel?: 'high' | 'medium' | 'low' }>;
  involvedParties?: Array<{ name: string; role: string }>;
  effectiveDate?: string;
  expirationDate?: string;
  contractValue?: string;
  governingLaw?: string;
}


// Contract Object
export interface Contract {
  id: string;
  name: string;
  uploadedBy: string; // User ID or name
  uploadDate: string; // ISO Date string
  status: ContractStatus;
  version: number;
  fileUrl?: string; // URL to the contract file in Cloud Storage (e.g., Supabase Storage)
  filePath?: string; // Path to the file in Cloud Storage, for AI summarization reference
  summary?: string | StructuredSummary; // AI-generated summary, can be simple text or structured
  templateId?: string; // If created from a template
  // Add other metadata fields as needed, e.g., clientName, effectiveDate, expiryDate
}

// Contract Template Object
export interface ContractTemplate {
  id: string;
  name: string;
  content: string; // HTML or Markdown content of the template
  createdBy: string; // User ID or name
  createDate: string; // ISO Date string
  lastModified: string; // ISO Date string
}

// Review Object
export interface Review {
  id: string;
  contractId: string;
  contractName: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerId?: string;
  submittedDate: string; // ISO Date string
  reviewDate?: string; // ISO Date string
  comments?: string;
}

// Task Item Object for Dashboard Alerts and Quick Links
export interface TaskItem {
  id: string;
  title: string;
  dueDate: string; // Can be relative ("2 days", "Tomorrow") or absolute date string
  priority: "High" | "Medium" | "Low";
  link?: string; // Link to the relevant page
  type: "Review" | "Renewal" | "Follow-up" | "Signature" | "Obligation" | "Approval" | "Negotiation" | "Amendment" | "Task"; // Added generic "Task"
  contractName?: string; // Associated contract name, if applicable
  status?: "Pending" | "In Progress" | "Completed" | "Overdue";
  assignee?: string; // User ID or name
  description?: string; // More details about the task
}
