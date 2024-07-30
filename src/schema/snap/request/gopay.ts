import { z } from "zod";
import { Transaction } from "./common";

export const GopayOptions = z.object({
  gopay: z
    .object({
      enableCallback: z.boolean(),
      callbackUrl: z.string(),
    })
    .optional(),
}).transform((data) => ({
  gopay: data.gopay,
  ...data
}));

export const SnapGopay = Transaction.merge(GopayOptions)
