import { z } from "zod";
import { SnapTransaction, VaOptions } from "./common";

export const BriVirtualAccountOptions = z.object({
  bri_va: VaOptions.optional(),
});
export const SnapBriVirtualAccount = SnapTransaction.merge(BriVirtualAccountOptions);
