import { ConfigurationError } from "./error";

type EnvironmentType = "sandbox" | "production";

export interface NextransClientAccessKeys {
  clientKey: string;
}

/// Nextrans initialization options.
interface NextransClientOpts {
  sandbox: NextransClientAccessKeys;
  production?: NextransClientAccessKeys;

  environment?: EnvironmentType;
}

export default class NextransClient {
  environment: EnvironmentType;
  accessKeys: NextransClientAccessKeys;

  constructor(opts: NextransClientOpts) {
    this.environment = opts.environment ?? "sandbox";

    switch (this.environment) {
      case "sandbox":
        this.accessKeys = opts.sandbox;
        break;
      case "production":
        if (!opts.production)
          throw new ConfigurationError(
            "environment is production, yet production access keys are undefined.",
          );
        this.accessKeys = opts.production;
        break;
    }
  }
}
