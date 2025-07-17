import { CoreRepository } from "./repository/core";
import { Snap, SnapImpl } from "./snap";
import { MidtransSnapRepository } from "./repository/snap/midtrans";
import { MidtransCoreRepository } from "./repository/core/midtrans";
import { SnapRepository } from "./repository/snap/repository";
import { AccessKeys, MidtransRequester } from "./requester/midtrans";
import { Requester } from "./requester/requester";

const SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com";
const PRODUCTION_BASE_URL = "https://app.midtrans.com";

export interface NextransClient {
  snap: Snap;
}

type OptsRepos = {
  snap?: ({ requester }: { requester: Requester }) => SnapRepository;
  core?: ({ requester }: { requester: Requester }) => CoreRepository;
};

type OptsRequester =
  | {
      fetch?: typeof fetch;

      // `baseUrl` is set to sandbox by default
      baseUrl?: string;
    }
  | {
      use: Requester;
    };

export type NextransOpts =
  | {
      requester?: OptsRequester;
      repos?: OptsRepos;
      accessKeys: AccessKeys;
    }
  | {
      requester?: Omit<
        Extract<OptsRequester, { fetch?: typeof fetch }>,
        "baseUrl"
      >;
      repos?: OptsRepos;
      accessKeys: AccessKeys;

      // `mode` sets the base url of requester.
      //
      // if `mode: "sandbox"`, then `requester.baseUrl: "https://app.sandbox.midtrans.com"`
      // if `mode: "production"`, then `requester.baseUrl: "https://app.midtrans.com"`
      mode: "sandbox" | "production";
    };

export class Nextrans implements NextransClient {
  public readonly snap: Snap;

  constructor(opts: NextransOpts) {
    let requester: Requester;

    if (opts.requester && "use" in opts.requester) {
      // use a custom requester
      requester = opts.requester.use;
    } else {
      // use or configure the default requester
      let baseUrl = SANDBOX_BASE_URL;
      if ("mode" in opts) {
        baseUrl =
          opts.mode === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
      } else if (
        opts.requester &&
        "baseUrl" in opts.requester &&
        opts.requester.baseUrl
      ) {
        baseUrl = opts.requester.baseUrl;
      }

      let fetchFn = fetch;
      if (opts.requester && "fetch" in opts.requester && opts.requester.fetch) {
        fetchFn = opts.requester.fetch;
      }

      requester = new MidtransRequester({
        accessKeys: opts.accessKeys,
        baseUrl: baseUrl,
        fetch: fetchFn,
      });
    }

    this.snap = new SnapImpl(
      opts.repos?.snap
        ? opts.repos.snap({ requester })
        : new MidtransSnapRepository({ requester }),
      opts.repos?.core
        ? opts.repos.core({ requester })
        : new MidtransCoreRepository({ requester }),
      opts.accessKeys,
    );
  }
}
