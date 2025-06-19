import { none, type Option, some } from "../../main.ts";

export class AsyncOption<T> {
  private readonly promise: Promise<Option<T>>;

  constructor(promise: Promise<Option<T>>) {
    this.promise = promise.catch(() => none());
  }

  static fromOption<T>(option: Option<T>): AsyncOption<T> {
    return new AsyncOption(Promise.resolve(option));
  }

  static fromPromise<T>(promise: Promise<T>): AsyncOption<T> {
    return new AsyncOption(promise.then((val) => some(val), () => none()));
  }

  async getOption(): Promise<Option<T>> {
    return this.promise;
  }

  async isSome(): Promise<boolean> {
    return (await this.promise).isSome();
  }

  async isSomeAnd(
    fn: (val: T) => boolean | Promise<boolean>,
  ): Promise<boolean> {
    return (await this.promise).match({
      Some: (val) => fn(val),
      None: () => false,
    });
  }

  async isNone(): Promise<boolean> {
    return (await this.promise).isNone();
  }

  async isNoneOr(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean> {
    return (await this.promise).match({
      Some: (val) => fn(val),
      None: () => true,
    });
  }

  async unwrap(): Promise<T> {
    return (await this.promise).unwrap();
  }

  async unwrapOr(defaultValue: T): Promise<T> {
    return (await this.promise).unwrapOr(defaultValue);
  }

  async unwrapOrElse(fn: () => Promise<T> | T): Promise<T> {
    return (await this.promise).match({
      Some: (val) => val,
      None: () => fn(),
    });
  }

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
        None: async () => none(),
      }),
    );
  }

  inspect(fn: (val: T) => void): AsyncOption<T> {
    this.promise.then((option) => option.inspect(fn));

    return this;
  }

  async mapOr<U>(defaultValue: U, fn: (val: T) => Promise<U> | U): Promise<U> {
    return (await this.promise).match({
      Some: (val) => fn(val),
      None: () => defaultValue,
    });
  }

  async mapOrElse<U>(
    defaultFn: () => Promise<U> | U,
    someFn: (val: T) => Promise<U> | U,
  ): Promise<U> {
    return (await this.promise).match({
      Some: (val) => someFn(val),
      None: () => defaultFn(),
    });
  }

  okOr<E>(err: E): never { // not yet implemented
    throw err;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    const opt = await this.promise;

    if (opt.isSome()) {
      yield opt.unwrap();
    }
  }

  and<U>(optionB: AsyncOption<U>): AsyncOption<U> {
    return new AsyncOption(
      this.match({
        Some: async () => optionB.getOption(),
        None: async () => none(),
      }),
    );
  }

  andThen<U>(fn: (val: T) => AsyncOption<U>): AsyncOption<U> {
    return new AsyncOption(
      this.match({
        Some: async (val) => fn(val).getOption(),
        None: async () => none(),
      }),
    );
  }

  filter(fn: (val: T) => boolean | Promise<boolean>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: async (val) => await fn(val) ? some(val) : none(),
        None: async () => none(),
      }),
    );
  }

  or(optionB: AsyncOption<T>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: async (val) => some(val),
        None: async () => optionB.getOption(),
      }),
    );
  }

  orElse(fn: () => AsyncOption<T>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: async (val) => some(val),
        None: async () => fn().getOption(),
      }),
    );
  }

  xor(optionB: AsyncOption<T>): AsyncOption<T> {
    return new AsyncOption(
      this.match({
        Some: (val: T) =>
          optionB.match<Option<T>>({
            Some: async () => none(),
            None: async () => some(val),
          }),
        None: () =>
          optionB.match<Option<T>>({
            Some: async (val) => some(val),
            None: async () => none(),
          }),
      }),
    );
  }

  zip<U>(optionB: AsyncOption<U>): AsyncOption<[T, U]> {
    return new AsyncOption(
      this.match({
        Some: (val: T) =>
          optionB.match<Option<[T, U]>>({
            Some: (val2: U) => some([val, val2]),
            None: () => none(),
          }),
        None: () => none(),
      }),
    );
  }

  zipWith<U, R>(
    optionB: AsyncOption<U>,
    fn: (optA: T, optB: U) => R,
  ): AsyncOption<R> {
    return new AsyncOption(
      this.match({
        Some: (val: T) =>
          optionB.match<Option<R>>({
            Some: (val2: U) => some(fn(val, val2)),
            None: () => none(),
          }),
        None: () => none(),
      }),
    );
  }

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
