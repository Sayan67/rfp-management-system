import { z } from 'zod';

// Schema for creating a vendor
export const createVendorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Vendor name is required'),
    email: z.string().email('Invalid email address'),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    category: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// Schema for updating a vendor
export const updateVendorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vendor ID'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    category: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// Schema for getting vendor by ID
export const getVendorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vendor ID'),
  }),
});

// Schema for deleting vendor
export const deleteVendorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vendor ID'),
  }),
});

// Schema for listing vendors
export const listVendorsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
  }).optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type GetVendorInput = z.infer<typeof getVendorSchema>;
export type DeleteVendorInput = z.infer<typeof deleteVendorSchema>;
export type ListVendorsInput = z.infer<typeof listVendorsSchema>;
