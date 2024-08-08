import { z } from "zod";
import { FraudStatus, TransactionStatus } from "src/other/transaction/schema";

export const TransactionNotificationCommon = z.object({
  transaction_time: z.string(),
  transaction_status: TransactionStatus,
  transaction_id: z.string(),

  settlement_time: z.string().optional(),
  status_message: z.string(),
  status_code: z.string(),
  signature_key: z.string(),

  order_id: z.string(),
  merchant_id: z.string(),
  gross_amount: z.string(),

  fraud_status: FraudStatus,
  currency: z.string(),
});

const ShopeePayType = z.object({ payment_type: z.literal("shopeepay") });
const AkulakuType = z.object({ payment_type: z.literal("akulaku") });
const GopayType = z.object({ payment_type: z.literal("gopay") });

export const QrisType = z.object({
  payment_type: z.literal("qris"),
  transaction_type: z.union([z.literal("on-us"), z.literal("off-us")]),
  issuer: z.string(),
  acquirer: z.union([z.literal("airpay shopee"), z.literal("gopay")]).or(z.string()),
});

export const CStoreType = z.object({
  payment_type: z.literal("cstore"),
  payment_code: z.string(),
});

export const AlfamartType = CStoreType.extend({ store: z.literal("alfamart") });
export const IndomaretType = CStoreType.extend({
  store: z.literal("indomaret"),
  approval_code: z.string(),
});

export const CardType = z.object({
  payment_type: z.literal("credit_card"),

  /**
   * The first six-digit and last four-digit of customer's credit card number.
   */
  masked_card: z.string(),

  /**
   * The 3D secure ECI code for a card transaction.
   */
  eci: z.string(),
  channel_response_message: z.string(),
  channel_response_code: z.string(),
  card_type: z.union([z.literal("Credit"), z.literal("Debit")]),
  bank: z.string(),

  /**
   * Can be used to refund a transaction. `approval_code` does not exist on
   * transactions that are deemed as fraud.
   */
  approval_code: z.string().optional(),
});

const BankVa = z.object({
  va_numbers: z.array(
    z.object({
      va_number: z.string(),
      bank: z.string(),
    }),
  ),
  payment_amounts: z.array(
    z.object({
      paid_at: z.string(),
      amount: z.string(),
    }),
  ),
});

const PermataVAType = z.object({
  payment_type: z.literal("bank_transfer"),
  permata_va_number: z.string(),
  bank: z.literal("permata"),
});
const BcaVAType = BankVa.extend({
  payment_type: z.literal("bank_transfer"),
  bank: z.literal("bca"),
});
const BniVAType = BankVa.extend({
  payment_type: z.literal("bank_transfer"),
  bank: z.literal("bni"),
});
const MandiriBillType = z.object({
  payment_type: z.literal("echannel"),
  biller_code: z.string(),
  bill_key: z.string(),
});

export const TransactionNotification = z.intersection(
  TransactionNotificationCommon,
  z.discriminatedUnion("payment_type", [
    ShopeePayType,
    AkulakuType,
    GopayType,
    AlfamartType,
    IndomaretType,
    CardType,
    QrisType,
    BcaVAType,
    BniVAType,
    PermataVAType,
    MandiriBillType,
  ]),
);
