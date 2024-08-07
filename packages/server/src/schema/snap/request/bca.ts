import { z } from "zod";
import { Transaction } from "./common";

export const BcaOptions = z
  .object({
    va_number: z.number(),
    sub_company_code: z.string().optional(),
    free_text: z
      .object({
        inquiry: z.record(z.string(), z.string()),
        payment: z.record(z.string(), z.string()),
      })
      .optional(),
  })
  .optional();

export const SnapBcaVirtualAccount = Transaction.extend({
  bca_va: BcaOptions,
});
