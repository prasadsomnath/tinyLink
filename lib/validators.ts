import { z } from "zod";

export const codeRegex = /^[A-Za-z0-9]{6,8}$/;

export const createLinkSchema = z.object({
  targetUrl: z.string().url("Enter a valid URL"),
  code: z
    .string()
    .trim()
    .regex(codeRegex, "Code must be 6-8 alphanumeric characters")
    .optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
