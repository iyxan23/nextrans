export interface Requester {
  post(endpoint: string, body: any): Promise<Response>;
  get(endpoint: string, params: URLSearchParams): Promise<Response>;
}
