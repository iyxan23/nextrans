import { z } from "zod";
import { Transaction } from "./common";

export const PermataVirtualAccountOptions = z.object({
  permataVa: z
    .object({
      vaNumber: z.boolean(),
      recipientName: z.string().optional(),
    })
    .optional(),
});

export const SnapPermataVirtualAccountObject = Transaction.merge(
  PermataVirtualAccountOptions,
);
