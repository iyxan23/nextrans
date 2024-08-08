import { z } from "zod";

export const AlfamartType = z.object({
  type: z.literal("alfamart"),
  store: z.string(),
  payment_code: z.string(),
  approval_code: z.string(),
});

