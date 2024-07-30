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
