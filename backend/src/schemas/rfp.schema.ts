import { z } from 'zod';

// Schema for creating RFP from natural language
export const createRFPSchema = z.object({
  body: z.object({
    naturalLanguageInput: z.string().min(10, 'Input must be at least 10 characters'),
  }),
});

// Schema for sending RFP to vendors
export const sendRFPSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid RFP ID'),
  }),
  body: z.object({
    vendorIds: z.array(z.string().uuid()).min(1, 'At least one vendor must be selected'),
  }),
});

// Schema for getting RFP by ID
export const getRFPSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid RFP ID'),
  }),
});

// Schema for listing RFPs with filters
export const listRFPsSchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'SENT', 'CLOSED']).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

export type CreateRFPInput = z.infer<typeof createRFPSchema>;
export type SendRFPInput = z.infer<typeof sendRFPSchema>;
export type GetRFPInput = z.infer<typeof getRFPSchema>;
export type ListRFPsInput = z.infer<typeof listRFPsSchema>;
