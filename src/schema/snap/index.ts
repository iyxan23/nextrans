// original types are sourced from restuwahyu13/midtrans-node
// url: https://github.com/restuwahyu13/midtrans-node/blob/fbd66e6140015962fd10b58995f757fd4b3d9392/src/types/snap.ts
//
// originally licensed with the MIT License by restuwahyu13

import { z } from "zod";
import {
  CustomerDetailOptions,
  DynamicDescriptorOptions,
  ItemDetailsOptions,
  ShippingDetailOptions,
  TransactionDetailOptions,
} from "./request/common";
import { SnapShopeePay } from "./request/shopeePay";
import { CreditCardOptions } from "./request/creditCard";
import { BcaOptions } from "./request/bca";
import { BriVirtualAccountOptions } from "./request/bri";
import { PermataVirtualAccountOptions } from "./request/permata";

export const CallbacksOptions = z
  .object({
    finish: z.string(),
  })
  .transform((data) => ({
    finish: data.finish,
  }));

export const ExpiryOptions = z
  .object({
    startTime: z.string(),
    unit: z.string(),
    duration: z.number(),
  })
  .transform((data) => ({
    startTime: data.startTime,
    unit: data.unit,
    duration: data.duration,
  }));

export const SnapFull = z.object({
  transactionDetails: TransactionDetailOptions,
  itemDetails: ItemDetailsOptions.optional(),
  customerDetails: CustomerDetailOptions.optional(),
  shippingAddress: ShippingDetailOptions.optional(),
  enabledPayments: z.array(z.string()).optional(),

  creditCard: CreditCardOptions.optional(),
  whitelistBins: z.array(z.string()).optional(),
  dynamicDescriptor: DynamicDescriptorOptions.optional(),
  bcaVa: BcaOptions.optional(),
  briVa: BriVirtualAccountOptions.optional(),
  permataVa: PermataVirtualAccountOptions.optional(),
  shopeepay: SnapShopeePay.optional(),

  callbacks: CallbacksOptions.optional(),
  expiry: ExpiryOptions.optional(),

  customField1: z.string().optional(),
  customField2: z.string().optional(),
  customField3: z.string().optional(),
});
