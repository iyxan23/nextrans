import { Transaction } from "src/schemas/transaction";
import { CoreRepository, ParseError } from "./repository";
import { Requester } from "src/requester";

export class MidtransCoreRepository implements CoreRepository {
  private requester: Requester;
  constructor({ requester }: { requester: Requester }) {
    this.requester = requester;
  }

  async getTransactionStatus(
    id: { transactionId: string } | { orderId: string },
  ): Promise<Transaction> {
    const endpoint = `/v2/${"transactionId" in id ? id.transactionId : id.orderId}/status`;
    const result = await this.requester.get(endpoint, new URLSearchParams());

    // parse it
    const parseResult = await Transaction.safeParseAsync(result);

    if (!parseResult.success) {
      throw new ParseError(endpoint, new URLSearchParams(), parseResult.error);
    }

    return parseResult.data;
  }
}
