// Sourced from: https://docs.midtrans.com/docs/https-notification-webhooks

import { Transaction } from "../../other/transaction/schema";
import { type Requester } from "../../requester";
import * as crypto from "crypto";

/*
 * An example payment notification as described by midtrans
 *
 * {
 *  "transaction_time": "2020-01-09 18:27:19",
 *  "transaction_status": "capture",
 *  "transaction_id": "57d5293c-e65f-4a29-95e4-5959c3fa335b",
 *  "status_message": "midtrans payment notification",
 *  "status_code": "200",
 *  "signature_key": "16dbf...8ba",
 *  "payment_type": "credit_card",
 *  "order_id": "Postman-1578568851",
 *  "merchant_id": "G141532850",
 *  "masked_card": "48111111-1114",
 *  "gross_amount": "10000.00",
 *  "fraud_status": "accept",
 *  "eci": "05",
 *  "currency": "IDR",
 *  "channel_response_message": "Approved",
 *  "channel_response_code": "00",
 *  "card_type": "credit",
 *  "bank": "bni",
 *  "approval_code": "1578569243927"
 * }
 */

/*
 * Types of transaction status as described by midtrans
 *
 * capture	      ✅	Transaction is successful and card balance is captured successfully. If no action is taken by you, the transaction will be successfully settled on the same day or the next day or within your agreed settlement time with your partner bank. Then the transaction status changes to settlement.It is safe to assume a successful payment.
 * settlement	    ✅	The transaction is successfully settled. Funds have been credited to your account.
 * pending	      🕒	The transaction is created and is waiting to be paid by the customer at the payment providers like Bank Transfer, E-Wallet, and so on. For card payment method: waiting for customer to complete (and card issuer to validate) 3DS/OTP process.
 * deny	          ❌	The credentials used for payment are rejected by the payment provider or Midtrans Fraud Detection System (FDS). To know the reason and details for the denied transaction, see the status_message in the response.
 * cancel	        ❌	The transaction is canceled. It can be triggered by merchant. You can trigger Cancel status in the following cases: 1. If you cancel the transaction after Capture status.
 * expire	        ❌	Transaction is not available for processing, because the payment was delayed.
 * failure	      ❌	Unexpected error occurred during transaction processing.
 * refund	        ↩️	  Transaction is marked to be refunded. Refund status can be triggered by merchant.
 * partial_refund	↩️	  Transaction is marked to be refunded partially (if you choose to refund in amount less than the paid amount). Refund status can be triggered by merchant.
 * authorize	    🕒	Only available specifically only if you are using pre-authorize feature for card transactions (an advanced feature that you will not have by default, so in most cases are safe to ignore). Transaction is successful and card balance is reserved (authorized) successfully. You can later perform API “capture” to change it into capture, or if no action is taken will be auto released. Depending on your business use case, you may assume authorize status as a successful transaction.
 */

/*
 * Status codes and how to handle them as described by midtrans
 *
 * 2XX	    No retries, it is considered successful.
 * 500	    Retry only once.
 * 503	    Retry four times.
 * 40[04]	  Retry two times.
 * 30[123]  No retries. Update notification endpoint in SETTINGS menu, instead of replying to these status codes.
 * 30[78]	Follow the new URL with POST method and the same notification body. Maximum number of redirect is five times.
 * Other	  Retry five times.
 *
 * Notes:
 *  - As written in 30[123],
 *    "Update notification endpoint in SETTINGS menu, instead of replying to these status codes".
 *    is extremely vague, any explanation regarding "SETTINGS menu" is nowhere to be seen in the docs.
 *    Perhaps it meant to update the notification endpoint from the dashboard?
 */

/*
 * Midtrans' Best Practices to handling incoming notifications
 *
 * https://docs.midtrans.com/docs/https-notification-webhooks#best-practice-to-handle-notification
 *
 * Main Takeaways:
 *  - Use HTTPS.
 *  - Midtrans may send multiple notification for the same transaction in *extremely rare cases*.
 *  - Ignore notification with "fraud_status" with value other than "accept"
 *  - Midtrans may not send the notifications in *extremely rare cases*.
 *  - Respond to notifications immediately to reduce load.
 *  - Midtrans may send notifications out-of-order in *extremely rare cases*, say settlement status comes before pending status.
 *  - Allow unknown fields to be added to the notification body for future-proofing.
 *  - Use the right HTTP Status Code when responding to notifications.
 *  - Midtrans will also retry a similar amount to the above when encountering HTTP error status codes.
 *  - Midtrans retry at most 5 times with following policy, and each with different intervals.
 *  - Use the "GET Status API request" to as the source-of-truth, midtrans' notification system can be fragile in *extremely rare cases*.
 *  - Fetch "GET Status API request" after receiving the notification to double-check whether the notification is valid.
 */

export type NotificationHandler<T, R extends Promise<T> | T> = () => R;
export type HandlerCallbackReturn =
  | { continue: true }
  | { continue: false; response: Response }
  | void;

// will handle checking notification and fetching the transaction
export function createFetchHandler(
  coreRequester: Requester,
  serverKey: string,
  {
    beforeTransactionRecheck,
    processNotification,
    onInvalidBody,
    onInvalidSignature,
    onSuccess,
  }: {
    /**
     * Callback performed when notification has successfully been properly validated,
     * and proven to be authentic. Just before the best-practice transaction fetch to
     * midtrans.
     */
    beforeTransactionRecheck?: (
      notification: Transaction,
    ) => Promise<HandlerCallbackReturn>;

    /**
     * Callback performed to process the incoming notification, provided with the
     * same transaction that has been fetched from midtrans itself for "best-practices".
     *
     * Take the `transaction`
     */
    processNotification: (
      notification: Transaction,
      transaction: Transaction,
    ) => Promise<HandlerCallbackReturn>;

    /**
     * Callback performed when the retrieved notification body is either incorrectly
     * parsed, or has changed its shape. Essentially, failure to parse the notification
     * body completely will trigger this callback.
     *
     * You can either return `{ continue: true }` (or return nothing) which will return
     * a 500 to midtrans right away, or give your own response with `{ continue: false,
     * response: Response }`.
     */
    onInvalidBody?: (
      body: any,
      request: Request,
    ) => Promise<HandlerCallbackReturn>;

    /**
     * Callback performed when the received notification has successfully been parsed,
     * yet failed to verify its authenticity.
     */
    onInvalidSignature?: (
      notification: Transaction,
      request: Request,
    ) => Promise<HandlerCallbackReturn>;

    /**
     * Callback performed when the received notification has successfully been parsed,
     * verified, and processed.
     */
    onSuccess?: (
      notification: Transaction,
      transaction: Transaction,
    ) => Promise<HandlerCallbackReturn>;
  },
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      const r = (await onInvalidBody?.(undefined, req)) ?? { continue: true };

      if (!r.continue) return r.response;
      return new Response("Invalid JSON body", { status: 400 });
    }

    const transactionParseResult = await Transaction.safeParseAsync(body);
    if (!transactionParseResult.success) {
      const r = (await onInvalidBody?.(body, req)) ?? { continue: true };

      if (!r.continue) return r.response;
      return new Response("Invalid body", { status: 400 });
    }
    const transaction = transactionParseResult.data;

    // verify the transaction authenticity
    if (!verifyAuthenticity(transaction, serverKey)) {
      const r = (await onInvalidSignature?.(transaction, req)) ?? {
        continue: true,
      };

      if (!r.continue) return r.response;
      return new Response("Invalid signature", { status: 403 });
    }

    const transactionRecheckResult = (await beforeTransactionRecheck?.(
      transaction,
    )) ?? { continue: true };

    if (!transactionRecheckResult.continue)
      return transactionRecheckResult.response;

    // |======= TODO ======================================================== !!!!!
    // | Move responsibilities of managing the transaction to another class   !!!!!
    // |======= TODO ======================================================== !!!!!

    // make a request to the status API
    const statusResp = await coreRequester.get(
      `/v2/${transaction.transaction_id}/status`,
      new URLSearchParams(),
    );

    // parse it
    let transactionStatus;
    try {
      const transactionStatusParseResult =
        await Transaction.safeParseAsync(statusResp);

      if (!transactionStatusParseResult.success) {
        console.error("Invalid transaction schema");
        console.error(transactionStatusParseResult.error);

        return new Response("Internal server error", { status: 500 });
      }

      transactionStatus = transactionStatusParseResult.data;
    } catch (e) {
      console.error("Unable to retrieve json body from transaction API");
      console.error(e);

      return new Response("Internal server error", { status: 500 });
    }

    const pr = (await processNotification(transaction, transactionStatus)) ?? {
      continue: true,
    };
    if (!pr.continue) return pr.response;

    const sr = (await onSuccess?.(transaction, transactionStatus)) ?? {
      continue: true,
    };
    if (!sr.continue) return sr.response;

    return new Response(null, { status: 200 });
  };
}

async function verifyAuthenticity(
  notification: Transaction,
  serverKey: string,
): Promise<boolean> {
  // signature key is SHA512(order_id+status_code+gross_amount+ServerKey)
  const shouldBe = await crypto.subtle
    .digest(
      "SHA-512",
      Buffer.from(
        `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`,
      ),
    )
    .then((x) => Buffer.from(x).toString("hex"));

  return shouldBe === notification.signature_key;
}
