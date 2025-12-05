import { z } from 'zod';

// Schema for getting proposals for an RFP
export const getProposalsForRFPSchema = z.object({
  params: z.object({
    rfpId: z.string().uuid('Invalid RFP ID'),
  }),
});

// Schema for getting a single proposal
export const getProposalSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid proposal ID'),
  }),
});

// Schema for getting comparison
export const getComparisonSchema = z.object({
  params: z.object({
    rfpId: z.string().uuid('Invalid RFP ID'),
  }),
});

export type GetProposalsForRFPInput = z.infer<typeof getProposalsForRFPSchema>;
export type GetProposalInput = z.infer<typeof getProposalSchema>;
export type GetComparisonInput = z.infer<typeof getComparisonSchema>;
