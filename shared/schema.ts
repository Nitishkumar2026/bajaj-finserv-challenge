import { z } from "zod";

// Input validation schema
export const arrayInputSchema = z.object({
  data: z.array(z.string())
});

export type ArrayInput = z.infer<typeof arrayInputSchema>;

// Response schema for POST /bfhl
export const arrayResponseSchema = z.object({
  is_success: z.boolean(),
  user_id: z.string(),
  email: z.string(),
  roll_number: z.string(),
  numbers: z.array(z.string()),
  alphabets: z.array(z.string()),
  highest_alphabet: z.string().optional()
});

export type ArrayResponse = z.infer<typeof arrayResponseSchema>;

// Response schema for GET /bfhl
export const operationResponseSchema = z.object({
  operation_code: z.number()
});

export type OperationResponse = z.infer<typeof operationResponseSchema>;