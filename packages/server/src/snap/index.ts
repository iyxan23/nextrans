import { CoreRepository } from "src/repository/core";
import { createFetchHandler, FetchHandlerOptions } from "./notification";
import { type SnapRepository } from "../repository/snap/repository";
import { SnapTransaction } from "./schema/request/common";
import { z } from "zod";
import { AccessKeys } from "src/requester/midtrans";
import * as crypto from "crypto";
import { Transaction } from "src/schemas/transaction";

export type FetchNotificationHandlerOptions =
  | (FetchHandlerOptions & {
    /**
     * If true, will not verify the authenticity of the notification.
     * This options is unsafe, and should be used with caution; this is not to
     * be used in a production environment.
     */
    noVerify: false;
  })
  | (Omit<FetchHandlerOptions, "verifyAuthenticity"> & {
    /**
     * If true, will not verify the authenticity of the notification.
     * This options is unsafe, and should be used with caution; this is not to
     * be used in a production environment.
     */
    noVerify: true;
  });

export interface Snap {
  createTransaction: (
    transaction: z.infer<typeof SnapTransaction>,
  ) => Promise<{ token: string; redirect_url: string }>;

  createFetchNotificationHandler(
    opts: FetchNotificationHandlerOptions,
  ): (req: Request) => Promise<Response>;
}

// @internal
export class SnapImpl implements Snap {
  constructor(
    private snapRepository: SnapRepository,
    private coreRepository: CoreRepository,
    private accessKeys: AccessKeys,
  ) { }

  createFetchNotificationHandler(
    opts: FetchNotificationHandlerOptions,
  ): (req: Request) => Promise<Response> {
    return createFetchHandler(this.coreRepository, {
      verifyAuthenticity: opts.noVerify
        ? undefined
        : (notification) =>
          verifyAuthenticity(notification, this.accessKeys.serverKey),
      ...opts,
    });
  }

  async createTransaction(
    transaction: z.infer<typeof SnapTransaction>,
  ): Promise<{ token: string; redirect_url: string }> {
    return this.snapRepository.createTransaction(transaction);
  }
}

async function verifyAuthenticity(
  notification: Pick<
    Transaction,
    "order_id" | "status_code" | "gross_amount" | "signature_key"
  >,
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
