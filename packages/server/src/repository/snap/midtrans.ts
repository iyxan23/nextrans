import { type Requester } from "src/requester/requester";
import { type SnapRepository } from "./repository";
import { type SnapTransaction } from "src/snap/schema/request/common";
import { z } from "zod";

export class MidtransSnapRepository implements SnapRepository {
  private requester: Requester;

  constructor({ requester }: { requester: Requester }) {
    this.requester = requester;
  }

  async createTransaction(
    transaction: z.infer<typeof SnapTransaction>,
  ): Promise<{ token: string; redirect_url: string }> {
    return this.requester
      .post("/snap/v1/transactions", transaction)
      .then((r) =>
        z.object({ token: z.string(), redirect_url: z.string() }).parseAsync(r),
      );
  }
}
