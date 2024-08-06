export class NextransError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NextransError";
  }
}

export class ConfigurationError extends NextransError {
  constructor(message: string) {
    super(`Failed to configure Nextrans: ${message}`);
    this.name = "ConfigurationError";
  }
}

export class UnauthorizedError extends NextransError {
  constructor(message: string) {
    super(`Unauthorized: ${message}`);
    this.name = "UnauthorizedError";
  }
}

export class MidtransError extends NextransError {
  constructor(message: string) {
    super(`Midtrans Error: ${message}`);
    this.name = "MidtransError";
  }
}
