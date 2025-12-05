// Shared types between frontend and backend

export enum RFPStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  CLOSED = 'CLOSED',
}

export enum ProposalStatus {
  RECEIVED = 'RECEIVED',
  PARSED = 'PARSED',
  REVIEWED = 'REVIEWED',
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface RFPItem {
  name: string;
  quantity: number;
  specifications: string;
}

export interface ProposalItemPricing {
  item: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface RFP {
  id: string;
  title: string;
  description?: string | null;
  items: RFPItem[];
  budget?: number | null;
  deliveryDeadline?: Date | string | null;
  paymentTerms?: string | null;
  warrantyRequirements?: string | null;
  otherRequirements?: string | null;
  status: RFPStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson?: string | null;
  phone?: string | null;
  address?: string | null;
  category?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Proposal {
  id: string;
  rfpId: string;
  vendorId: string;
  itemsPricing?: ProposalItemPricing[] | null;
  totalPrice?: number | null;
  deliveryTime?: string | null;
  paymentTerms?: string | null;
  warranty?: string | null;
  additionalNotes?: string | null;
  rawEmailContent?: string | null;
  parsedAt?: Date | string | null;
  status: ProposalStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RFPVendor {
  id: string;
  rfpId: string;
  vendorId: string;
  sentAt?: Date | string | null;
  emailStatus: EmailStatus;
  createdAt: Date | string;
}

// Extended types with relations
export interface RFPWithRelations extends RFP {
  proposals?: (Proposal & { vendor: Vendor })[];
  rfpVendors?: (RFPVendor & { vendor: Vendor })[];
}

export interface ProposalWithRelations extends Proposal {
  rfp?: RFP;
  vendor?: Vendor;
}

// Comparison types
export interface ProposalComparison {
  priceScore: number;
  deliveryScore: number;
  termsScore: number;
  completenessScore: number;
  totalScore: number;
  ranking: number;
}

export interface ProposalComparisonResult {
  proposal: ProposalWithRelations;
  comparison: ProposalComparison;
}

export interface ComparisonResponse {
  proposals: ProposalComparisonResult[];
  recommendation: {
    vendorId: string;
    vendorName: string;
    reasoning: string;
    strengths: string[];
    concerns: string[];
  };
  summary: string;
}
