import { z } from "zod";
import { Transaction } from "./common";

export const PermataVirtualAccountOptions = z.object({
  permata_va: z
    .object({
      va_number: z.boolean(),
      recipient_name: z.string().optional(),
    })
    .optional(),
});

export const SnapPermataVirtualAccountObject = Transaction.merge(
  PermataVirtualAccountOptions,
);
