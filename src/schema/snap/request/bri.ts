import { z } from "zod";
import { Transaction, VaOptions } from "./common";

export const BriVirtualAccountOptions = z.object({
  bri_va: VaOptions.optional(),
});
export const SnapBriVirtualAccount = Transaction.merge(BriVirtualAccountOptions);
