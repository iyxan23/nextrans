import { z } from "zod";
import { SnapTransaction } from "./common";

export const GopayOptions = z.object({
  gopay: z
    .object({
      enable_callback: z.boolean(),
      callback_url: z.string(),
    })
    .optional(),
});

export const SnapGopay = SnapTransaction.merge(GopayOptions);
