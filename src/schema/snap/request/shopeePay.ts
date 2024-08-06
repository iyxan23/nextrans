import { z } from "zod";
import { Transaction } from "./common";

export const ShopeePayOptions = z.object({
  shopeepay: z.object({ enable_callback: z.boolean() }).optional(),
})

export const SnapShopeePay = Transaction.merge(ShopeePayOptions);
