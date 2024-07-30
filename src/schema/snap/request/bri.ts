import { z } from "zod";
import { Transaction, VaOptions } from "./common";

export const BriVirtualAccountOptions = z.object({
  briVa: VaOptions.optional(),
});
export const SnapBriVirtualAccount = Transaction.merge(BriVirtualAccountOptions);
