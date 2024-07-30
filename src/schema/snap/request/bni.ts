import { z } from "zod";
import { Transaction, VaOptions } from "./common";

export const BniVirtualAccountOptions = z.object({
  bniVa: VaOptions.optional(),
});
export const SnapBniVirtualAccount = Transaction.merge(BniVirtualAccountOptions)
