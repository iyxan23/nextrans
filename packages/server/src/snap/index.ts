import { type AccessKeys } from "src/nextrans";
import { type Requester } from "../requester";
import { createFetchHandler } from "./notification";
import { type Transaction } from "./schema/request/common";
import { z } from "zod";

export class Snap {
  private requester: Requester;
  private accessKeys: AccessKeys;

  constructor({
    requester,
    accessKeys,
  }: {
    requester: Requester;
    accessKeys: AccessKeys;
  }) {
    this.requester = requester;
    this.accessKeys = accessKeys;
  }

  createFetchNotificationHandler(
    opts: Parameters<typeof createFetchHandler>[2],
  ): (req: Request) => Promise<Response> {
    return createFetchHandler(this.requester, this.accessKeys.serverKey, opts);
  }

  async createTransaction(
    transaction: z.infer<typeof Transaction>,
  ): Promise<{ token: string; redirectUrl: string }> {
    return this.requester
      .post("/snap/v1/transactions", transaction)
      .then((r) =>
        z.object({ token: z.string(), redirectUrl: z.string() }).parseAsync(r),
      );
  }
}
