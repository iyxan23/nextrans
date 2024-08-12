import { type AccessKeys } from "src/nextrans";
import { type Requester } from "../requester";
import { createFetchHandler } from "./notification";
import { type Transaction } from "./schema/request/common";
import { z } from "zod";

export class Snap {
  private snapRequester: Requester;
  private coreRequester: Requester;
  private accessKeys: AccessKeys;

  constructor({
    snapRequester,
    coreRequester,
    accessKeys,
  }: {
    snapRequester: Requester;
    coreRequester: Requester;
    accessKeys: AccessKeys;
  }) {
    this.snapRequester = snapRequester;
    this.coreRequester = coreRequester;
    this.accessKeys = accessKeys;
  }

  createFetchNotificationHandler(
    opts: Parameters<typeof createFetchHandler>[2],
  ): (req: Request) => Promise<Response> {
    return createFetchHandler(
      this.coreRequester,
      this.accessKeys.serverKey,
      opts,
    );
  }

  async createTransaction(
    transaction: z.infer<typeof Transaction>,
  ): Promise<{ token: string; redirect_url: string }> {
    return this.snapRequester
      .post("/snap/v1/transactions", transaction)
      .then((r) => r.json())
      .then((r) =>
        z.object({ token: z.string(), redirect_url: z.string() }).parseAsync(r),
      );
  }
}
