import { z } from "zod";
import { SnapTransaction } from "./common";

export const ShopeePayOptions = z.object({
  shopeepay: z.object({ enable_callback: z.boolean() }).optional(),
})

export const SnapShopeePay = SnapTransaction.merge(ShopeePayOptions);
