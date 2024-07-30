import { z } from "zod";
import {
  DynamicDescriptorOptions,
  InstallmentOptions,
  Transaction,
} from "./common";

export const CreditCardOptions = z.object({
  creditCard: z
    .object({
      secure: z.boolean().optional(),
      bank: z.string(),
      channel: z.string().optional(),
      type: z.string().optional(),
      whitelistBins: z.array(z.string()).optional(),
      installment: InstallmentOptions.optional(),
      dynamicDescriptor: DynamicDescriptorOptions.optional(),
    })
    .optional(),
});

export const SnapCreditCard = Transaction.merge(CreditCardOptions);
