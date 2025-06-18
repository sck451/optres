/**
 * A class that represents the failure of an `unwrap` operation.
 *
 * Can be called by:
 *
 * * {@link None#unwrap}
 * * {@link Ok#unwrapErr}
 * * {@link Err#unwrap}
 *
 * `error` will contain the unexpected value. For `Err#unwrap`, it will be
 * the Result's error value. For `Ok#unwrapErr`, it will be the Result's
 * success value. For `None#unwrap`, it will be `null`.
 */
export class UnwrapError<E = unknown> extends Error {
  /**
   * Construct a new UnwrapError instance.
   * @param message A custom error message
   * @param error The unexpected value that was present
   */
  constructor(message: string, public error: E) {
    super();

    this.message = message;
    this.error = error;
  }
}
