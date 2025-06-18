export class UnwrapError<E = unknown> extends Error {
  error: E;

  constructor(message: string, error: E) {
    super();

    this.message = message;
    this.error = error;
  }
}
