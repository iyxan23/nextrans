export interface Requester {
  post(endpoint: string, body: any): Promise<any>;
  get(endpoint: string, params: URLSearchParams): Promise<any>;
}
