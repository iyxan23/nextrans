import { z } from "zod";

export const TransactionDetailOptions = z
  .object({
    order_id: z.string(),
    gross_amount: z.number(),
  })

export const BillingAddressOptions = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string(),
    city: z.string(),
    postal_code: z.string(),
    country_code: z.string().optional(),
  })

export const ItemDetailsOptions = z
  .object({
    id: z.string().optional(),
    price: z.number(),
    quantity: z.number(),
    name: z.string(),
    brand: z.string().optional(),
    category: z.string().optional(),
    merchant_name: z.string().optional(),
    tenor: z.number().optional(),
    code_plan: z.number().optional(),
    mid: z.number().optional(),
  })

export const CustomerDetailOptions = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string(),
    billing_address: BillingAddressOptions.optional(),
  })

export const ShippingDetailOptions = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string(),
    billing_address: BillingAddressOptions.optional(),
  })

export const DynamicDescriptorOptions = z.object({
  merchant_name: z.string(),
  city_name: z.string(),
  country_code: z.string(),
});

export const InstallmentOptions = z.object({
  required: z.boolean(),
  terms: z.record(z.string(), z.array(z.number())),
});

export const vaOptions = z.object({ va_number: z.boolean() });

export const Transaction = z.object({
  transaction_details: TransactionDetailOptions,
  item_details: ItemDetailsOptions.array().optional(),
  customer_details: CustomerDetailOptions.optional(),
  shipping_address: ShippingDetailOptions.optional(),
  enabled_payments: z.array(z.string()).optional(),
});
