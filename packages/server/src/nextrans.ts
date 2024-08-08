import { z } from "zod";
import {
  ConfigurationError,
  MidtransError,
  NextransError,
  UnauthorizedError,
} from "./error";
import { type Transaction } from "./snap/schema/request/common";

type EnvironmentType = "sandbox" | "production";

const SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com";
const PRODUCTION_BASE_URL = "https://app.midtrans.com";

export interface NextransAccessKeys {
  merchantId: string;
  serverKey: string;
}

/// Nextrans initialization options.
interface NextransOpts {
  sandbox: NextransAccessKeys;
  production?: NextransAccessKeys;

  environment?: EnvironmentType;
  fetch?: typeof fetch;

  baseUrl?: string;
}

export class Nextrans {
  private accessKeys: NextransAccessKeys;
  private environment: EnvironmentType;
  private baseUrl: string;

  private fetch: typeof fetch;

  constructor(opts: NextransOpts) {
    this.environment = opts.environment ?? "sandbox";

    if (typeof fetch === "undefined" && !opts.fetch)
      throw new ConfigurationError(
        "window fetch is undefined, please provide one on the fetch field: `Nextrans({ ..., fetch: customFetch })`",
      );

    this.fetch = opts.fetch ?? fetch;

    switch (this.environment) {
      case "sandbox":
        this.accessKeys = opts.sandbox;
        this.baseUrl = SANDBOX_BASE_URL;
        break;

      case "production":
        if (!opts.production)
          throw new ConfigurationError(
            "environment is production, yet production access keys are undefined.",
          );
        this.accessKeys = opts.production;
        this.baseUrl = PRODUCTION_BASE_URL;
        break;
    }

    if (opts.baseUrl) this.baseUrl = opts.baseUrl;
  }

  private async post(
    endpoint: string,
    body: any,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.fetch(this.baseUrl + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Basic " +
          Buffer.from(this.accessKeys.serverKey + ":").toString("base64"),
        ...headers,
      },
      body: JSON.stringify(body),
    }).then(async (response) => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new UnauthorizedError("Access Keys are invalid");
        }

        if (response.status > 400 && response.status < 500) {
          const text = await response.text();
          throw new NextransError(`Error: ${response.status} ${response.statusText}, ${text}`);
        }

        throw new MidtransError(
          `Midtrans Error: ${response.status} ${response.statusText}, ${await response.text()}`,
        );
      }

      return response;
    });
  }

  async createSnapTransaction(
    transaction: z.infer<typeof Transaction>,
  ): Promise<{ token: string; redirect_url: string }> {
    return this.post("/snap/v1/transactions", transaction)
      .then((r) => r.json())
      .then((json) =>
        z
          .object({
            token: z.string(),
            redirect_url: z.string(),
          })
          .parseAsync(json),
      );
  }
}
