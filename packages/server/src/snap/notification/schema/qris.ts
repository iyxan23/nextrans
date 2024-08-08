import { z } from "zod";

export const QrisType = z.object({
  type: z.literal("qris"),
  transaction_type: z.string(),
  issuer: z.string(),
  acquirer: z.string(),
});

