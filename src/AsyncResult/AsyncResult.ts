import { err, ok, type Result } from "../Result/Result.ts";
import { AsyncOption } from "../AsyncOption/AsyncOption.ts";
import { none, type Option, some } from "../Option/Option.ts";

/**
 * A wrapper around a `Promise<Result<T, E>>` providing functional-style combinators.
 *
 * Your code will work best if you call this with explicit type parameters, as it is
 * hard to infer correct types for asynchronous calls.
 *
 * @typeParam T - The success type.
 * @typeParam E - The error type (defaults to `never`).
 */
export class AsyncResult<T, E = never> {
  /**
   * Construct a new `AsyncResult<T, E>` from a `Promise<Result<T, E>>`.
   * @param promise A promise that will resolve to a {@link Result}
   */
  constructor(private readonly promise: Promise<Result<T, E>>) {}

  /**
   * Wraps an immediate {@link Result} into an `AsyncResult`.
   *
   * @typeParam T - The success type.
   * @typeParam E - The error type.
   * @param result - A synchronous `Result`.
   * @returns An `AsyncResult` resolved with the provided `Result`.
   */
  static fromResult<T, E>(result: Result<T, E>): AsyncResult<T, E> {
    return new AsyncResult(Promise.resolve(result));
  }

  /**
   * Converts a `Promise<T>` into an `AsyncResult<T, E>`.
   * Resolves to `ok(T)` on fulfillment, or `err(E)` on rejection.
   *
   * @typeParam T - The type of the fulfilled value.
   * @typeParam E - The error type, defaults to `unknown`. It is best to be explicit
   * with this, as it is hard to know what possible errors a Promise may fail with.
   * @param promise - A promise to convert.
   * @returns An `AsyncResult` representing the promise's outcome.
   */
  static fromPromise<T, E = unknown>(promise: Promise<T>): AsyncResult<T, E> {
    return new AsyncResult(
      promise.then((val) => ok(val), (error) => err(error)),
    );
  }

  /**
   * Returns the internal `Promise<Result<T, E>>`.
   *
   * @returns A promise resolving to a `Result<T, E>`.
   */
  async getResult(): Promise<Result<T, E>> {
    return this.promise;
  }

  /**
   * Determines whether the result is {@link Ok}.
   *
   * @returns A boolean promise resolving to `true` if `Ok`, `false` otherwise.
   */
  async isOk(): Promise<boolean> {
    return (await this.promise).isOk();
  }

  /**
   * Determines whether the result is {@link Ok} and satisfies a predicate.
   *
   * @param fn - A function applied to the success value.
   * @returns A boolean promise.
   */
  async isOkAnd(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean> {
    return this.match({
      Ok: fn,
      Err: () => false,
    });
  }

  /**
   * Determines whether the result is {@link Err}
   * @returns A boolean promise resolving to `true` if `Err`, `false` otherwise.
   */
  async isErr(): Promise<boolean> {
    return (await this.promise).isErr();
  }

  /**
   * Determines whether the result is {@link Err} and satisfies a predicate.
   *
   * @param fn - A function applied to the error value.
   * @returns A boolean promise.
   */
  async isErrAnd(fn: (err: E) => boolean | Promise<boolean>): Promise<boolean> {
    return this.match({
      Ok: () => false,
      Err: fn,
    });
  }

  /**
   * Converts the `AsyncResult` to an {@link AsyncOption}. An `Ok` value becomes
   * {@link Some}; an `Err` value becomes {@link None}.
   *
   * @returns An `AsyncOption` containing the value or `None`.
   */
  ok(): AsyncOption<T> {
    return new AsyncOption(
      this.match<Option<T>>({
        Ok: some,
        Err: none,
      }),
    );
  }

  /**
   * Converts the `AsyncResult` to an {@link AsyncOption}. An `Err` value becomes
   * {@link Some}; an `Ok` value becomes {@link None}.
   *
   * @returns An `AsyncOption` containing the error or `None`.
   */
  err(): AsyncOption<E> {
    return new AsyncOption(
      this.match<Option<E>>({
        Ok: none,
        Err: some,
      }),
    );
  }

  /**
   * Transforms the `Ok` value with a function.
   *
   * @typeParam U - The result type.
   * @param fn - A function to map the `Ok` value.
   * @returns A new `AsyncResult` with the mapped value or original error.
   */
  map<U>(fn: (val: T) => Promise<U> | U): AsyncResult<U, E> {
    return new AsyncResult(
      this.match<Result<U, E>>({
        Ok: async (val: T) => ok(await fn(val)),
        Err: err,
      }),
    );
  }

  /**
   * Applies a function to the `Ok` value or returns a default.
   *
   * @typeParam U - The output type.
   * @param defaultValue - The value to return if `Err`.
   * @param fn - Function to apply to the `Ok` value.
   * @returns A promise of the result.
   */
  async mapOr<U>(
    defaultValue: U | Promise<U>,
    fn: (val: T) => U | Promise<U>,
  ): Promise<U> {
    return this.match({
      Ok: async (val) => await fn(val),
      Err: async () => await defaultValue,
    });
  }

  /**
   * Like {@link mapOr}, but the default is computed from the `Err` value.
   *
   * @typeParam U - The output type.
   * @param defaultFn - Function to apply to the `Err` value.
   * @param fn - Function to apply to the `Ok` value.
   * @returns A promise of the result.
   */
  async mapOrElse<U>(
    defaultFn: (err: E) => U | Promise<U>,
    fn: (val: T) => U | Promise<U>,
  ): Promise<U> {
    return this.match({
      Ok: async (val) => await fn(val),
      Err: async (err) => await defaultFn(err),
    });
  }

  /**
   * Maps the error value.
   *
   * @typeParam F - The new error type.
   * @param fn - Function to transform the error.
   * @returns A new `AsyncResult` with the original value or the mapped error.
   */
  mapErr<F>(fn: (error: E) => F | Promise<F>): AsyncResult<T, F> {
    return new AsyncResult(
      this.match<Result<T, F>>({
        Ok: ok,
        Err: async (error) => err(await fn(error)),
      }),
    );
  }

  /**
   * Runs a side-effect on `Ok`, preserving the original result.
   *
   * @param fn - Side-effect function.
   * @returns A new `AsyncResult` with the same value.
   */
  inspect(fn: (val: T) => void | Promise<void>): AsyncResult<T, E> {
    return new AsyncResult(this.match<Result<T, E>>({
      Ok: async (val) => {
        await fn(val);
        return ok(val);
      },
      Err: async (error) => err(error),
    }));
  }

  /**
   * Runs a side-effect on `Err`, preserving the original result.
   *
   * @param fn - Side-effect function.
   * @returns A new `AsyncResult` with the same value.
   */
  inspectErr(fn: (err: E) => void | Promise<void>): AsyncResult<T, E> {
    return new AsyncResult(this.match<Result<T, E>>({
      Ok: async (val) => ok(val),
      Err: async (error) => {
        await (fn(error));
        return err(error);
      },
    }));
  }

  /**
   * Enables use in `for await...of`. Yields `T` if `Ok`, otherwise yields nothing.
   */
  async *[Symbol.asyncIterator](): AsyncIteratorObject<T, void> {
    const res = await this.promise;

    if (res.isOk()) {
      yield res.unwrap();
    }
  }

  /**
   * Unwraps the value if `Ok`, otherwise throws an error.
   *
   * @param message - Optional error message.
   * @throws {Error} If the result is `Err`.
   * @returns The contained value.
   */
  async unwrap(
    message: string = `Expected ok() but got err(${this})`,
  ): Promise<T> {
    return (await this.promise).unwrap(message);
  }

  /**
   * Unwraps the error if `Err`, otherwise throws an error.
   *
   * @param message - Optional error message.
   * @throws {Error} If the result is `Ok`.
   * @returns The contained error.
   */
  async unwrapErr(
    message: string = `Expected error but got ok(${this})`,
  ): Promise<E> {
    return (await this.promise).unwrapErr(message);
  }

  /**
   * Combines with another `AsyncResult`, returning the second if `this` is `Ok`,
   * else the original error. Note that the error types of the two results must
   * be compatible.
   *
   * @typeParam U - The success type of the second result.
   * @param resultB - The second result.
   * @returns A new `AsyncResult`.
   */
  and<U>(resultB: AsyncResult<U, E>): AsyncResult<U, E> {
    return new AsyncResult(this.match({
      Ok: () => resultB.getResult(),
      Err: err,
    }));
  }

  /**
   * Applies a function returning `AsyncResult` if `Ok`, or propagates the error.
   * Note that the error types of this `AsyncResult` and that returned from `fn`
   * must be compatible.
   *
   * @typeParam U - The success type of the returned result.
   * @param fn - Function to transform the success value.
   * @returns A new `AsyncResult`.
   */
  andThen<U>(fn: (val: T) => AsyncResult<U, E>): AsyncResult<U, E> {
    return new AsyncResult(this.match({
      Ok: (val) => fn(val).getResult(),
      Err: err,
    }));
  }

  /**
   * Applies a function returning `AsyncResult` and merges error types.
   *
   * @typeParam U - The success type.
   * @typeParam F - The additional error type.
   * @param fn - Function returning `AsyncResult`.
   * @returns A new `AsyncResult`.
   */
  chain<U, F>(fn: (value: T) => AsyncResult<U, F>): AsyncResult<U, E | F> {
    const okFn: (value: T) => Promise<Result<U, E | F>> = async (val: T) =>
      fn(val).getResult();

    return new AsyncResult(this.match({
      Ok: okFn,
      Err: err,
    }));
  }

  /**
   * Returns this result if `Ok`, or another result if `Err`.
   *
   * @typeParam F - The error type of the second result.
   * @param resultB - The fallback result.
   * @returns A new `AsyncResult`.
   */
  or<F>(resultB: AsyncResult<T, F>): AsyncResult<T, F> {
    return new AsyncResult(this.match({
      Ok: ok,
      Err: () => resultB.getResult(),
    }));
  }

  /**
   * Applies a fallback function if `Err`.
   *
   * @typeParam F - The fallback error type.
   * @param fn - Function returning a fallback `AsyncResult`.
   * @returns A new `AsyncResult`.
   */
  orElse<F>(fn: (err: E) => AsyncResult<T, F>): AsyncResult<T, F> {
    return new AsyncResult(this.match({
      Ok: ok,
      Err: (err) => fn(err).getResult(),
    }));
  }

  /**
   * Returns the value if `Ok`, or a fallback value if `Err`.
   *
   * @param defaultValue - The fallback value.
   * @returns A promise resolving to the value.
   */
  async unwrapOr(defaultValue: T): Promise<T> {
    return (await this.promise).unwrapOr(defaultValue);
  }

  /**
   * Returns the value if `Ok`, or computes one from the error.
   *
   * @param fn - Function that maps error to fallback value.
   * @returns A promise of the result.
   */
  async unwrapOrElse(fn: (err: E) => T | Promise<T>): Promise<T> {
    return this.match({
      Ok: (val) => val,
      Err: (error) => fn(error),
    });
  }

  /**
   * Applies pattern matching for `Ok` and `Err`.
   *
   * @typeParam R - The return type.
   * @param matcher - Object with `Ok` and `Err` handler functions.
   * @returns A promise resolving to the handler result.
   */
  async match<R>(matcher: {
    Ok: (val: T) => R | Promise<R>;
    Err: (err: E) => R | Promise<R>;
  }): Promise<R> {
    const result = await this.promise;

    if (result.isOk()) {
      return await matcher.Ok(result.unwrap());
    } else {
      return await matcher.Err(result.unwrapErr());
    }
  }

  /**
   * Returns `AsyncResult()` for internal debugging.
   *
   * @returns A string representation.
   */
  toString(): string {
    return `AsyncResult()`;
  }

  /**
   * Sets the default string tag for the class.
   */
  get [Symbol.toStringTag](): string {
    return `AsyncResult`;
  }
}
