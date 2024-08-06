import { z } from "zod";
import { Transaction } from "./common";

export const GopayOptions = z.object({
  gopay: z
    .object({
      enable_callback: z.boolean(),
      callback_url: z.string(),
    })
    .optional(),
});

export const SnapGopay = Transaction.merge(GopayOptions);
