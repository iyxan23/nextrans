
import { type SnapTransaction } from "src/snap/schema/request/common";
import { type z } from "zod";

export interface SnapRepository {
  createTransaction(
    transaction: z.infer<typeof SnapTransaction>
  ): Promise<{ token: string; redirect_url: string }>;
}
