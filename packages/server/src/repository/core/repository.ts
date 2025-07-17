import { NextransError } from "src/error";
import { type Transaction } from "src/schemas/transaction";

// reference: https://docs.midtrans.com/reference/core-api-overview

export interface CoreRepository {
  getTransactionStatus(
    id: { transactionId: string } | { orderId: string },
  ): Promise<Transaction>;
}

export class ParseError extends NextransError {
  constructor(
    public endpoint: string,
    public searchParams: URLSearchParams,
    public error: Error,
  ) {
    super("ParseError at `" + endpoint + "?" + searchParams + "`: " + error);
    this.name = "ParseError";
  }
}
