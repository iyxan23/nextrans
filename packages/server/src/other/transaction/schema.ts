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

export const Transaction = z.object({
  masked_card: z.string(),
  approval_code: z.string(),

  bank: z.string(),
  eci: z.string(),

  status_code: z.string(),
  status_message: z.string(),

  channel_response_code: z.string(),
  channel_response_message: z.string(),
  settlement_time: z.string(),
  transaction_time: z.string(),
  transaction_id: z.string(),
  transaction_status: TransactionStatus,

  gross_amount: z.string(),
  currency: z.string(),
  order_id: z.string(),
  payment_type: z.string(),

  signature_key: z.string(),
  fraud_status: FraudStatus,

  merchant_id: z.string(),

  card_type: z.string(),
  three_ds_version: z.union([z.literal("1"), z.literal("2")]).or(z.string()),

  /**
   * Whether the 3DS 2 challenge input was completed by customer, for Card payment.
   * Field may not exist if 3DS 2 challenge input was not prompted.
   */
  challenge_completion: z.boolean().optional(),

  // todo: POINT fields
});
