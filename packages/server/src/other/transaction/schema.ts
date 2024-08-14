import { z } from "zod";

export const TransactionStatus = z.union([
  /**
   * Transaction is successful and card balance is captured successfully.
   *
   * If no action taken, this transaction will then proceed to change to "settlement"
   * after some predetermined amount of time.
   *
   * It is safe to assume that tranasction is successful.
   */
  z.literal("capture"),

  /**
   * The transaction has successfully settled. Funds have been credited to the account.
   */
  z.literal("settlement"),

  /**
   * The transaction is created and is waiting to be paid by the customer using the
   * respective payment providers such as Bank Transfer, E-Wallet, or else.
   *
   * In case this transaction uses a card payment method, this indicates that the
   * customer is still in the process of completing (and for the card issuer to
   * validate) the 3DS/OTP process.
   */
  z.literal("pending"),

  /**
   * The credentials used for payment are rejected by the payment provider Midtrans'
   * fraud detection system.
   *
   * Look for `status_message` for further explanation.
   */
  z.literal("deny"),

  /**
   * The transaction is canceled. It can be triggered by the merchant through the
   * Midtrans dashboard.
   */
  z.literal("cancel"),

  /**
   * Transaction is not available for processing, due to the payment being delayed.
   */
  z.literal("expire"),

  /**
   * Unexpected error occurred during transaction processing. Something happened
   * on the Midtrans side.
   */
  z.literal("failure"),

  /**
   * Transaction is marked to be refunded. Can be triggered by the merchant through
   * the Midtrans dashboard.
   */
  z.literal("refund"),

  /**
   * Transaction is marked to be refunded partially, the case where the amount of
   * the refund is less than the amount of the original transaction. Can be triggered
   * by the merchant through the Midtrans dashboard.
   */
  z.literal("partial_refund"),

  /**
   * (Quoting from Midtrans' docs)
   *
   * Only available specifically only if you are using pre-authorize feature for
   * card transactions (an advanced feature that you will not have by default, so
   * in most cases are safe to ignore).
   *
   * Transaction is successful and card balance is reserved (authorized) successfully.
   * You can later perform API “capture” to change it into capture, or if no action is
   * taken will be auto released. Depending on your business use case, you may assume
   * authorize status as a successful transaction.
   */
  z.literal("authorize"),
]);

export const FraudStatus = z.union([z.literal("accept"), z.literal("deny")]);

export const TransactionCommon = z.object({
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

const QrisType = z.object({
  payment_type: z.literal("qris"),
  transaction_type: z.union([z.literal("on-us"), z.literal("off-us")]),
  issuer: z.string(),
  acquirer: z
    .union([z.literal("airpay shopee"), z.literal("gopay")])
    .or(z.string()),
});

const ConvenienceStoreType = z.intersection(
  z.object({
    payment_type: z.literal("cstore"),
    payment_code: z.string(),
  }),
  z.discriminatedUnion("store", [
    z.object({
      store: z.literal("alfamart"),
    }),
    z.object({
      store: z.literal("indomaret"),
      approval_code: z.string(),
    }),
  ]),
);

const CardType = z.object({
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

const BankTransferType = z.intersection(
  z.object({
    payment_type: z.literal("bank_transfer"),
  }),
  z.union([
    z.object({
      permata_va_number: z.string(),
      bank: z.literal("permata"),
    }),
    z.object({
      va_numbers: z.array(
        z.object({
          va_number: z.string(),
          bank: z.union([z.literal("bca"), z.literal("bni"), z.literal("cimb")]),
        }),
      ),
      payment_amounts: z.array(
        z.object({
          paid_at: z.string(),
          amount: z.string(),
        }),
      ),
    }),
  ]),
);

const MandiriBillType = z.object({
  payment_type: z.literal("echannel"),
  biller_code: z.string(),
  bill_key: z.string(),
});

export const Transaction = z.intersection(
  TransactionCommon,
  z.union([
    ShopeePayType,
    AkulakuType,
    GopayType,
    ConvenienceStoreType,
    CardType,
    QrisType,
    BankTransferType,
    MandiriBillType,
  ]),
);

export type Transaction = z.infer<typeof Transaction>;
export type TransactionStatus = z.infer<typeof TransactionStatus>;
