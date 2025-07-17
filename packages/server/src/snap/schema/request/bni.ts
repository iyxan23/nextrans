import { z } from "zod";
import { SnapTransaction, VaOptions } from "./common";

export const BniVirtualAccountOptions = z.object({
  bni_va: VaOptions.optional(),
});
export const SnapBniVirtualAccount = SnapTransaction.merge(BniVirtualAccountOptions)
