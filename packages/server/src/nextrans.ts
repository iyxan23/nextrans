import {
  ConfigurationError,
  MidtransError,
  NextransError,
  UnauthorizedError,
} from "./error";
import { Snap } from "./snap";
import { type Requester } from "./requester";

type EnvironmentType = "sandbox" | "production";

const SNAP_SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com";
const SNAP_PRODUCTION_BASE_URL = "https://app.midtrans.com";

const CORE_SANDBOX_BASE_URL = "https://api.sandbox.midtrans.com";
const CORE_PRODUCTION_BASE_URL = "https://api.midtrans.com";

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

  private snapRequester: Requester;
  private coreRequester: Requester;

  snap: Snap;

  constructor(opts: NextransOpts) {
    this.environment = opts.environment ?? "sandbox";

    let customFetch;
    let snapBaseUrl;
    let coreBaseUrl;

    if (typeof fetch === "undefined" && !opts.fetch)
      throw new ConfigurationError(
        "window fetch is undefined, please provide one on the fetch field: `Nextrans({ ..., fetch: customFetch })`",
      );

    customFetch = opts.fetch ?? fetch;

    switch (this.environment) {
      case "sandbox":
        this.accessKeys = opts.sandbox;
        snapBaseUrl = SNAP_SANDBOX_BASE_URL;
        coreBaseUrl = CORE_SANDBOX_BASE_URL;
        break;

      case "production":
        if (!opts.production)
          throw new ConfigurationError(
            "environment is production, yet production access keys are undefined.",
          );
        this.accessKeys = opts.production;
        snapBaseUrl = SNAP_PRODUCTION_BASE_URL;
        coreBaseUrl = CORE_PRODUCTION_BASE_URL;
        break;
    }

    if (opts.baseUrl) snapBaseUrl = opts.baseUrl;

    this.snapRequester = new NextransRequester({
      accessKeys: this.accessKeys,
      baseUrl: snapBaseUrl,
      fetch: customFetch,
    });

    this.coreRequester = new NextransRequester({
      accessKeys: this.accessKeys,
      baseUrl: coreBaseUrl,
      fetch: customFetch,
    });

    this.snap = new Snap({
      snapRequester: this.snapRequester,
      coreRequester: this.coreRequester,
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

  private static async tryJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch (e) {
      throw new MidtransError(
        `Failed fetching ${response.url}, content is not JSON.\nMidtrans Error: ${response.status} ${response.statusText}, ${await response.text()}`,
      );
    }
  }

  private static async failEarly(response: Response): Promise<Response> {
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedError("Access Keys are invalid");
      }

      if (response.status > 400 && response.status < 500) {
        const text = await response.text();
        throw new NextransError(
          `Failed fetching ${response.url}.\nError: ${response.status} ${response.statusText}, ${text}`,
        );
      }

      throw new MidtransError(
        `Failed fetching ${response.url}.\nMidtrans Error: ${response.status} ${response.statusText}, ${await response.text()}`,
      );
    }

    return NextransRequester.tryJson(response);
  }

  async post(
    endpoint: string,
    body: any,
    headers?: Record<string, string>,
  ): Promise<any> {
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
    }).then(NextransRequester.failEarly);
  }

  async get(
    endpoint: string,
    params: URLSearchParams,
    headers?: Record<string, string>,
  ): Promise<any> {
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
    }).then(NextransRequester.failEarly);
  }
}
