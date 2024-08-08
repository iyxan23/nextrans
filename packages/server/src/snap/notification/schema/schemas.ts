import { z } from "zod";
import { AlfamartType } from "./alfamart";
import { MandiriBillType } from "./mandiri";
import { CardType } from "./card";
import { BniVAType } from "./bni";
import { QrisType } from "./qris";
import { PermataVAType } from "./permata";

export const TransactionStatus = z.union([
  z.literal("capture"),
  z.literal("settlement"),
  z.literal("pending"),
  z.literal("deny"),
  z.literal("cancel"),
  z.literal("expire"),
  z.literal("failure"),
  z.literal("refund"),
  z.literal("partial_refund"),
  z.literal("authorize"),
]);

export const TransactionNotificationCommon = z.object({
  transaction_time: z.string(),
  transaction_status: TransactionStatus,
  transaction_id: z.string(),
  status_message: z.string(),
  status_code: z.string(),
  signature_key: z.string(),
  payment_type: z.string(),
  order_id: z.string(),
  merchant_id: z.string(),
  gross_amount: z.string(),
  fraud_status: z.string(),
  currency: z.string(),
  settlement_time: z.string(),
});

const ShopeePayType = z.object({ type: z.literal("shopeepay") });
const AkulakuType = z.object({ type: z.literal("akulaku") });
const GopayType = z.object({ type: z.literal("gopay") });

export const TransactionNotification = z.intersection(
  TransactionNotificationCommon,
  z.discriminatedUnion("type", [
    ShopeePayType,
    AkulakuType,
    GopayType,
    AlfamartType,
    CardType,
    BniVAType,
    QrisType,
    PermataVAType,
    MandiriBillType,
  ]),
);
