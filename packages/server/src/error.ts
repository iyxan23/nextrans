export class NextransError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NextransError";
  }
}

export class UnauthorizedError extends NextransError {
  constructor(message: string) {
    super(`Unauthorized: ${message}`);
    this.name = "UnauthorizedError";
  }
}
