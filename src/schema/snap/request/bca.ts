import { z } from "zod";
import { Transaction, VaOptions } from "./common";

export const BcaOptions = z
  .object({
    vaNumber: z.number(),
    subCompanyCode: z.string().optional(),
    freeText: z
      .object({
        inquiry: z.record(z.string(), z.string()),
        payment: z.record(z.string(), z.string()),
      })
      .optional(),
  })
  .optional();

export const SnapBcaVirtualAccount = Transaction.extend({
  bcaVa: BcaOptions,
});
