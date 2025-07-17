import { randomUUID } from "crypto";
import { type SnapRepository } from "./repository";
import { type SnapTransaction } from "src/snap/schema/request/common";
import { type FetchNotificationHandlerOptions } from "src/snap";
import { z } from "zod";

export class FakeSnapRepository implements SnapRepository {
  private transactions = new Map<string, any>();

  constructor(
    private generateRedirectUrl: (opts: {
      orderId: string;
      token: string;
    }) => string = ({ orderId }) =>
        `https://example.com/redirect/?order_id=${orderId}`,
  ) { }

  async createTransaction(
    transaction: z.infer<typeof SnapTransaction>,
  ): Promise<{ token: string; redirect_url: string }> {
    const token = `tok_${randomUUID()}`;
    const orderId = transaction.transaction_details.order_id;

    this.transactions.set(orderId, {
      transaction_status: "pending",
      ...transaction,
    });

    return {
      token: token,
      redirect_url: this.generateRedirectUrl({ orderId, token }),
    };
  }

  createFetchNotificationHandler(
    _opts: FetchNotificationHandlerOptions,
  ): (req: Request) => Promise<Response> {
    return async (_req: Request) => {
      return new Response("OK");
    };
  }
}
