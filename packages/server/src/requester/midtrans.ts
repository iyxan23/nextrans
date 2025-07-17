import { UnauthorizedError } from "src/error";
import { RequestError, type Requester } from "./requester";

export type AccessKeys = {
  merchantId: string;
  serverKey: string;
};

export class MidtransRequester implements Requester {
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
      throw new RequestError(
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
        throw new RequestError(
          `Failed fetching ${response.url}.\nError: ${response.status} ${response.statusText}, ${text}`,
        );
      }

      throw new RequestError(
        `Failed fetching ${response.url}.\nMidtrans Error: ${response.status} ${response.statusText}, ${await response.text()}`,
      );
    }

    return MidtransRequester.tryJson(response);
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
    }).then(MidtransRequester.failEarly);
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
    }).then(MidtransRequester.failEarly);
  }
}
