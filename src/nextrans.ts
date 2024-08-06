import { ConfigurationError } from "./error";

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
}
