import { z } from "zod";
import {
  ConfigurationError,
  MidtransError,
  NextransError,
  UnauthorizedError,
} from "./error";
import { type Transaction } from "./snap/schema/request/common";
import { Snap } from "./snap";
import { type Requester } from "./requester";

type EnvironmentType = "sandbox" | "production";

const SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com";
const PRODUCTION_BASE_URL = "https://app.midtrans.com";

export interface AccessKeys {
  merchantId: string;
  serverKey: string;
}

/// Nextrans initialization options.
interface NextransOpts {
  sandbox: AccessKeys;
  production?: AccessKeys;

  environment?: EnvironmentType;
  fetch?: typeof fetch;

  baseUrl?: string;
}

export class Nextrans {
  private accessKeys: AccessKeys;
  private environment: EnvironmentType;

  private requester: Requester;

  snap: Snap;

  constructor(opts: NextransOpts) {
    this.environment = opts.environment ?? "sandbox";

    let customFetch;
    let baseUrl;

    if (typeof fetch === "undefined" && !opts.fetch)
      throw new ConfigurationError(
        "window fetch is undefined, please provide one on the fetch field: `Nextrans({ ..., fetch: customFetch })`",
      );

    customFetch = opts.fetch ?? fetch;

    switch (this.environment) {
      case "sandbox":
        this.accessKeys = opts.sandbox;
        baseUrl = SANDBOX_BASE_URL;
        break;

      case "production":
        if (!opts.production)
          throw new ConfigurationError(
            "environment is production, yet production access keys are undefined.",
          );
        this.accessKeys = opts.production;
        baseUrl = PRODUCTION_BASE_URL;
        break;
    }

    if (opts.baseUrl) baseUrl = opts.baseUrl;

    this.requester = new NextransRequester({
      accessKeys: this.accessKeys,
      baseUrl,
      fetch: customFetch,
    });

    this.snap = new Snap({
      requester: this.requester,
      accessKeys: this.accessKeys,
    });
  }
}

class NextransRequester implements Requester {
  private accessKeys: AccessKeys;
  private baseUrl: string;
  private fetch: typeof fetch;

  constructor({
    accessKeys,
    baseUrl,
    fetch: fetch_,
  }: {
    accessKeys: AccessKeys;
    baseUrl: string;
    fetch: typeof fetch;
  }) {
    this.accessKeys = accessKeys;
    this.baseUrl = baseUrl;
    this.fetch = fetch_;
  }

  private async failEarly(response: Response): Promise<Response> {
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedError("Access Keys are invalid");
      }

      if (response.status > 400 && response.status < 500) {
        const text = await response.text();
        throw new NextransError(
          `Error: ${response.status} ${response.statusText}, ${text}`,
        );
      }

      throw new MidtransError(
        `Midtrans Error: ${response.status} ${response.statusText}, ${await response.text()}`,
      );
    }

    return response;
  }

  async post(
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
    }).then(this.failEarly);
  }

  async get(
    endpoint: string,
    params: URLSearchParams,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.fetch(this.baseUrl + endpoint + "?" + params.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Basic " +
          Buffer.from(this.accessKeys.serverKey + ":").toString("base64"),
        ...headers,
      },
    }).then(this.failEarly);
  }
}
