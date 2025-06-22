import { AsyncResult } from "../AsyncResult/AsyncResult.ts";
import { none, type Option, some } from "../Option/Option.ts";
import { ok } from "../Result/Ok.ts";
import { err, type Result } from "../Result/Result.ts";

/**
 * A wrapper around a `Promise<Option<T>>` providing functional-style combinators.
 * See {@link Option} for most of the relevant ideas.
 *
 * @typeParam T The type possibly contained in the `AsyncOption`
 */
export class AsyncOption<T> {
  private readonly promise: Promise<Option<T>>;

  /**
   * Construct a new `AsyncOption<T>` from a `Promise<Option<T>>`.
   * @param promise A promise that will resolve to a {@link Option}
   */
  constructor(promise: Promise<Option<T>>) {
    this.promise = promise.catch(() => none());
  }

  /**
   * Wraps an immediate {@link Option} into an `AsyncOption`.
   * @typeParam The type of the `Option`
   * @returns An `AsyncOption` resolved with the provided `Option`
   */
  static fromOption<T>(option: Option<T>): AsyncOption<T> {
    return new AsyncOption(Promise.resolve(option));
  }

  /**
   * Converts a `Promise<T>` into an `AsyncOption<T>`. Any successful promise
   * resolution is an {@link Ok} value; any rejection is a `None` value.
   * @param promise T The type that the Promise resolves to
   * @returns An `AsyncOption` resolved with the contents of the `Promise`
   */
  static fromPromise<T>(promise: Promise<T>): AsyncOption<T> {
    return new AsyncOption(promise.then((val) => some(val), () => none()));
  }

  /**
   * Returns the internal `Promise<Option<T>>`.
   * @returns A promise resolving to an `Option<T>`
   */
  async getOption(): Promise<Option<T>> {
    return this.promise;
  }

  /**
   * Test if the Option is an {@link Some} value.
   * @returns A promise resolving to a boolean
   */
  async isSome(): Promise<boolean> {
    return (await this.promise).isSome();
  }

  /**
   * Test if the Option is a {@link Some} value and a predicate passes
   * @param fn A function that tests the `Some` value and returns a boolean or a
   * Promise resolving to a boolean.
   * @returns `true` if `Some` and the predicate passes, otherwise `false`
   */
  async isSomeAnd(
    fn: (val: T) => boolean | Promise<boolean>,
  ): Promise<boolean> {
    return (await this.promise).match({
      Some: fn,
      None: () => false,
    });
  }

  /**
   * Test if the Option is a {@link None}
   * @returns `true` if `None`, otherwise `false`
   */
  async isNone(): Promise<boolean> {
    return (await this.promise).isNone();
  }

  /**
   * Test if the Option is a {@link None} and a predicate passes
   * @param fn A function that tests the `Some` value and returns a boolean or a
   * Promise resolving to a boolean.
   * @returns
   */
  async isNoneOr(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean> {
    return (await this.promise).match({
      Some: fn,
      None: () => true,
    });
  }

  /**
   * Unwrap the value or throw an Error of {@link None}
   * @throws {UnwrapError}
   * @returns A promise resolving to the unwrapped `Some` value.
   */
  async unwrap(): Promise<T> {
    return (await this.promise).unwrap();
  }

  /**
   * Return the value or a provided default if {@link None}.
   * @param defaultValue Value to return if `None`.
   * @returns A promise resolving to the `Some` value or `defaultValue`.
   */
  async unwrapOr(defaultValue: T): Promise<T> {
    return (await this.promise).unwrapOr(defaultValue);
  }

  /**
   * Return the value or the result of a function if {@link None}.
   * @param fn Function producing fallback value.
   * @returns A promise resolving to the `Some` value or result of `fn`.
   */
  async unwrapOrElse(fn: () => Promise<T> | T): Promise<T> {
    return (await this.promise).match({
      Some: (val) => val,
      None: fn,
    });
  }

  /**
   * Map a {@link Some} value to another with a function.
   * @param fn Function to apply to the value.
   * @returns A new {@link AsyncOption} with the mapped value or `None`.
   * @typeParam U The type that `map` will transform a `Some` value into
   */
  map<U>(fn: (val: T) => U | Promise<U>): AsyncOption<U> {
    return new AsyncOption(
      this.match({
        Some: async (val: T) => {
          try {
            return some(await fn(val));
          } catch {
            return none();
          }
        },
        None: none,
      }),
    );
  }

  /**
   * Run a function on the `Some` value for side effects. If the function
   * returns a Promise it is awaited before continuing.
   * @param fn Function to apply to the value.
   * @returns An unmodified {@link AsyncOption}.
   */
  inspect(fn: (val: T) => void | Promise<void>): AsyncOption<T> {
    return new AsyncOption(this.match<Option<T>>({
      Some: async (val) => {
        await fn(val);
        return some(val);
      },
      None: none,
    }));
  }

  /**
   * Map a `Some` with a function, else return a default value.
   * @param defaultValue Value to return if `None`.
   * @param fn Function to map the value.
   * @returns A promise resolving to the result of `fn` or `defaultValue`.
   * @typeParam U The type of the default value supplied for a None value and
   * the return value of the function supplied in the case of a Some value
   */
  async mapOr<U>(defaultValue: U, fn: (val: T) => Promise<U> | U): Promise<U> {
    return (await this.promise).match({
      Some: fn,
      None: () => defaultValue,
    });
  }

  /**
   * Map a `Some` with a function, or use a default function.
   * @param defaultFn Function to produce fallback value.
   * @param fn Function to apply to the value.
   * @returns Result of `fn` or `defaultFn`.
   * @typeParam U The type returned by the callback for a None value and
   * the return value of the function for a Some value
   */
  async mapOrElse<U>(
    defaultFn: () => Promise<U> | U,
    someFn: (val: T) => Promise<U> | U,
  ): Promise<U> {
    return (await this.promise).match({
      Some: someFn,
      None: defaultFn,
    });
  }

  /**
   * Convert the {@link Option} into a `Result`, mapping `Some` to
   * {@link Ok}.
   * @param err Error to use if `None`.
   * @returns A a promise resolving to an {@link Ok} if `Some`, or
   * {@link Err} otherwise.
   * @typeParam E The type of the error that is provided if the Option is a
   * `None` value
   */
  okOr<E>(error: E): AsyncResult<T, E> {
    return new AsyncResult(this.match<Result<T, E>>({
      Some: ok,
      None: () => err(error),
    }));
  }

  /**
   * Return an asynchronous iterator over the {@link Some} value.
   * @returns A JavaScript asynchronous iterator over 0 or 1 elements.
   */
  async *[Symbol.asyncIterator](): AsyncIteratorObject<T, void, never> {
    const opt = await this.promise;

    if (opt.isSome()) {
      yield opt.unwrap();
    }
  }

  /**
   * Return `optionB` if {@link Some}, otherwise `None`.
   * @param optionB Another `AsyncOption` to return if `Some`.
   * @returns A promise resolving to `optionB` if `Some`, else `None`.
   * @typeParam U The type of the value contained in `optionB`
   */
  and<U>(optionB: AsyncOption<U>): AsyncOption<U> {
    return new AsyncOption(
      this.match({
        Some: async () => optionB.getOption(),
        None: async () => none(),
      }),
    );
  }

  /**
   * Chain another `AsyncOption`-producing function if {@link Some}.
   * @param fn Function to map the value to another `AsyncOption`.
   * @returns A promise resolving to the result of `fn` if `Some`, else `None`.
   * @typeParam U The type of the value returned by the callback function
   */
  andThen<U>(fn: (val: T) => AsyncOption<U>): AsyncOption<U> {
    return new AsyncOption(
      this.match({
        Some: async (val) => fn(val).getOption(),
        None: async () => none(),
      }),
    );
  }

  /**
   * Keep {@link Some} if predicate passes, otherwise `None`.
   * @param fn Predicate function.
   * @returns `Some` if predicate returns `true`, else `None`.
   */
  filter(fn: (val: T) => boolean | Promise<boolean>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: async (val) => await fn(val) ? some(val) : none(),
        None: none,
      }),
    );
  }

  /**
   * Return self if {@link Some}, otherwise return `optionB`.
   * @param optionB Fallback {@link Some}.
   * @returns A promise resolving to an unmodified `AsyncOption` if
   * `Some`, otherwise `optionB`.
   */
  or(optionB: AsyncOption<T>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: some,
        None: () => optionB.getOption(),
      }),
    );
  }

  /**
   * Return self if {@link Some}, otherwise compute an `AsyncOption` with a
   * function.
   * @param fn Function returning a fallback `AsyncOption`.
   * @returns The original `Option` if `Some`, or the result of `fn`.
   */
  orElse(fn: () => AsyncOption<T>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: some,
        None: () => fn().getOption(),
      }),
    );
  }

  /**
   * Exclusive OR: returns `Some` if exactly one of two is {@link Some}. The
   * promises are executed in parallel.
   * @param optionB Another option to compare.
   * @returns A promise resolving to `Some` if exactly one input is `Some`,
   * else `None`.
   */
  xor(optionB: AsyncOption<T>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: (val: T) =>
          optionB.match<Option<T>>({
            Some: none,
            None: () => some(val),
          }),
        None: () =>
          optionB.match<Option<T>>({
            Some: some,
            None: none,
          }),
      }),
    );
  }

  /**
   * Zip two {@link AsyncOption}s into one `AsyncOption` of a tuple.
   * @param optionB The second option.
   * @returns An AsyncOption of `Some<[A, B]>` if both are `Some`, else `None`.
   * @typeParam U The type contained within `optionB`
   */
  zip<U>(optionB: AsyncOption<U>): AsyncOption<[T, U]> {
    return new AsyncOption(
      this.match({
        Some: (val: T) =>
          optionB.match<Option<[T, U]>>({
            Some: (val2: U) => some([val, val2]),
            None: none,
          }),
        None: none,
      }),
    );
  }

  /**
   * Zip two {@link AsyncOption}s with a combining function.
   * @param optionB The second option.
   * @param fn Function to combine values.
   * @returns An AsyncOption of `Some(fn(a, b))` if both are `Some`, else
   * `None`.
   * @typeParam U The type contained within `optionB`
   * @typeParam R The return type of the callback function if both `Option`s
   * are `Some` values
   */
  zipWith<U, R>(
    optionB: AsyncOption<U>,
    fn: (optA: T, optB: U) => R,
  ): AsyncOption<R> {
    return new AsyncOption(
      this.match({
        Some: (val: T) =>
          optionB.match<Option<R>>({
            Some: (val2: U) => some(fn(val, val2)),
            None: none,
          }),
        None: none,
      }),
    );
  }

  /**
   * Pattern match on the {@link AsyncOption}. If the handler functions return
   * promises, they will be awaited.
   * @param matcher Object with `Some` and `None` handler functions.
   * @returns Result of the matching function.
   * @typeParam U The type that must be returned by both callback functions.
   * If they need to be distinct types, the union of these types should be
   * supplied as an explicit type argument, e.g. `match<number, string>(...)`.
   */
  async match<U>(matcher: {
    Some: (val: T) => Promise<U> | U;
    None: () => Promise<U> | U;
  }): Promise<U> {
    const option = await this.promise;

    if (option.isSome()) {
      return await matcher.Some(option.unwrap());
    } else {
      return await matcher.None();
    }
  }
}
