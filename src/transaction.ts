import { type z } from "zod";
import {
  type TransactionDetailOptions,
  type Transaction,
  type ItemDetailsOptions,
  type CustomerDetailOptions,
  type ShippingDetailOptions,
} from "./schema/snap/request/common";
import { ConfigurationError } from "./error";

export class TransactionBuilder {
  private transactionDetails?: z.infer<typeof TransactionDetailOptions>;
  private itemDetails?: z.infer<typeof ItemDetailsOptions>[];
  private customerDetails?: z.infer<typeof CustomerDetailOptions>;
  private shippingAddress?: z.infer<typeof ShippingDetailOptions>;
  private enabledPayments?: string[];

  constructor() {}

  setDetails(transactionDetails: z.infer<typeof TransactionDetailOptions>) {
    this.transactionDetails = transactionDetails;
  }

  setAllItems(itemDetails: z.infer<typeof ItemDetailsOptions>[]) {
    this.itemDetails = itemDetails;
  }

  addItem(itemDetails: z.infer<typeof ItemDetailsOptions>) {
    if (!this.itemDetails) this.itemDetails = [];
    this.itemDetails.push(itemDetails);
  }

  setCustomer(customerDetails: z.infer<typeof CustomerDetailOptions>) {
    this.customerDetails = customerDetails;
  }

  setShipping(shippingAddress: z.infer<typeof ShippingDetailOptions>) {
    this.shippingAddress = shippingAddress;
  }

  addEnabledPayments(...enabledPayments: string[]) {
    this.enabledPayments = [
      ...(this.enabledPayments ?? []),
      ...enabledPayments,
    ];
  }

  build(): z.infer<typeof Transaction> {
    if (!this.transactionDetails) {
      throw new ConfigurationError("Transaction details are required.");
    }

    return {
      transaction_details: this.transactionDetails,
      item_details: this.itemDetails,
      customer_details: this.customerDetails,
      shipping_address: this.shippingAddress,
      enabled_payments: this.enabledPayments,
    };
  }
}
