import { z } from "zod";

export const TransactionDetailOptions = z
  .object({
    orderId: z.string(),
    grossAmount: z.number(),
  })

export const BillingAddressOptions = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    countryCode: z.string().optional(),
  })

export const ItemDetailsOptions = z
  .object({
    id: z.string().optional(),
    price: z.number(),
    quantity: z.number(),
    name: z.string(),
    brand: z.string().optional(),
    category: z.string().optional(),
    merchantName: z.string().optional(),
    tenor: z.number().optional(),
    codePlan: z.number().optional(),
    mid: z.number().optional(),
  })

export const CustomerDetailOptions = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    billingAddress: BillingAddressOptions.optional(),
  })

export const ShippingDetailOptions = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    billingAddress: BillingAddressOptions.optional(),
  })

export const DynamicDescriptorOptions = z.object({
  merchantName: z.string(),
  cityName: z.string(),
  countryCode: z.string(),
});

export const InstallmentOptions = z.object({
  required: z.boolean(),
  terms: z.record(z.string(), z.array(z.number())),
});

export const VaOptions = z.object({ vaNumber: z.boolean() });

export const Transaction = z.object({
  transactionDetails: TransactionDetailOptions,
  itemDetails: ItemDetailsOptions.array().optional(),
  customerDetails: CustomerDetailOptions.optional(),
  shippingAddress: ShippingDetailOptions.optional(),
  enabledPayments: z.array(z.string()).optional(),
});
