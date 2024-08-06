import { z } from "zod";
import {
  DynamicDescriptorOptions,
  InstallmentOptions,
  Transaction,
} from "./common";

export const CreditCardOptions = z.object({
  credit_card: z
    .object({
      secure: z.boolean().optional(),
      bank: z.string(),
      channel: z.string().optional(),
      type: z.string().optional(),
      whitelist_bins: z.array(z.string()).optional(),
      installment: InstallmentOptions.optional(),
      dynamic_descriptor: DynamicDescriptorOptions.optional(),
    })
    .optional(),
});

export const SnapCreditCard = Transaction.merge(CreditCardOptions);
