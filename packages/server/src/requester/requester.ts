import { NextransError } from "src/error";

export interface Requester {
  post(endpoint: string, body: any): Promise<unknown>;
  get(endpoint: string, params: URLSearchParams): Promise<unknown>;
}

export class RequestError extends NextransError {
  constructor(message: string) {
    super(`Error Requesting: ${message}`);
    this.name = "RequestError";
  }
}
