import { z } from "zod";
import { Transaction, VaOptions } from "./common";

export const BniVirtualAccountOptions = z.object({
  bni_va: VaOptions.optional(),
});
export const SnapBniVirtualAccount = Transaction.merge(BniVirtualAccountOptions)
