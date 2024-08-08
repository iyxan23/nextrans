import { z } from "zod";

export const MandiriBillType = z.object({
  type: z.literal("mandiri_bill"),
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

