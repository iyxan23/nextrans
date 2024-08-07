import { type z } from "zod";
import {
  type TransactionDetailOptions,
  type Transaction,
  type ItemDetailsOptions,
  type CustomerDetailOptions,
  type ShippingDetailOptions,
  type BillingAddressOptions,
} from "./schema/snap/request/common";
import { ConfigurationError } from "./error";

export class TransactionBuilder {
  private transactionDetails?: z.infer<typeof TransactionDetailOptions>;
  private itemDetails?: z.infer<typeof ItemDetailsOptions>[];
  private customerDetails?: z.infer<typeof CustomerDetailOptions>;
  private customerShippingAddress?: z.infer<typeof ShippingDetailOptions>;
  private customerBillingAddress?: z.infer<typeof BillingAddressOptions>;
  private enabledPayments?: string[];

  constructor() { }

  setDetails(transactionDetails: z.infer<typeof TransactionDetailOptions>) {
    this.transactionDetails = transactionDetails;
    return this;
  }

  setAllItems(itemDetails: z.infer<typeof ItemDetailsOptions>[]) {
    this.itemDetails = itemDetails;
    return this;
  }

  addItem(itemDetails: z.infer<typeof ItemDetailsOptions>) {
    if (!this.itemDetails) this.itemDetails = [];
    this.itemDetails.push(itemDetails);
    return this;
  }

  setCustomer(customerDetails: z.infer<typeof CustomerDetailOptions>) {
    this.customerDetails = customerDetails;
    return this;
  }

  setShippingAddress(shippingAddress: z.infer<typeof ShippingDetailOptions>) {
    this.customerShippingAddress = shippingAddress;
    return this;
  }

  setBillingAddress(billlingAddress: z.infer<typeof BillingAddressOptions>) {
    this.customerBillingAddress = billlingAddress;
    return this;
  }

  addEnabledPayments(...enabledPayments: string[]) {
    this.enabledPayments = [
      ...(this.enabledPayments ?? []),
      ...enabledPayments,
    ];
    return this;
  }

  build(): z.infer<typeof Transaction> {
    if (!this.transactionDetails) {
      throw new ConfigurationError("Transaction details are required.");
    }

    if (
      (!!this.customerShippingAddress || !!this.customerBillingAddress) &&
      !this.customerDetails
    ) {
      throw new ConfigurationError(
        "Customer details are required if shipping or billing address are set.",
      );
    }

    return {
      transaction_details: this.transactionDetails,
      item_details: this.itemDetails,
      customer_details: this.customerDetails
        ? {
          ...this.customerDetails,
          ...(this.customerShippingAddress
            ? { shipping_address: this.customerShippingAddress }
            : {}),
          ...(this.customerBillingAddress
            ? { billing_address: this.customerBillingAddress }
            : {}),
        }
        : undefined,
      enabled_payments: this.enabledPayments,
    };
  }
}
