import { z } from "zod";

export const BcaVAType = z.object({
  type: z.literal("bca_va"),
  va_numbers: z.array(
    z.object({
      va_number: z.string(),
      bank: z.string(),
    })
  ),
  payment_amounts: z.array(
    z.object({
      paid_at: z.string(),
      amount: z.string(),
    })
  ),
});

