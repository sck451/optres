import { err, ok, type Result } from "../Result/Result.ts";
import { AsyncOption } from "../AsyncOption/AsyncOption.ts";
import { none, type Option, some } from "../Option/Option.ts";

export class AsyncResult<T, E = never> {
  constructor(private readonly promise: Promise<Result<T, E>>) {}

  static fromResult<T, E>(result: Result<T, E>): AsyncResult<T, E> {
    return new AsyncResult(Promise.resolve(result));
  }

  static fromPromise<T, E = unknown>(promise: Promise<T>): AsyncResult<T, E> {
    return new AsyncResult(
      promise.then((val) => ok(val), (error) => err(error)),
    );
  }

  async getResult(): Promise<Result<T, E>> {
    return this.promise;
  }

  async isOk(): Promise<boolean> {
    return (await this.promise).isOk();
  }

  async isOkAnd(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean> {
    return this.match({
      Ok: fn,
      Err: () => false,
    });
  }

  async isErr(): Promise<boolean> {
    return (await this.promise).isErr();
  }

  async isErrAnd(fn: (err: E) => boolean | Promise<boolean>): Promise<boolean> {
    return this.match({
      Ok: () => false,
      Err: fn,
    });
  }

  ok(): AsyncOption<T> {
    return new AsyncOption(
      this.match<Option<T>>({
        Ok: some,
        Err: none,
      }),
    );
  }

  err(): AsyncOption<E> {
    return new AsyncOption(
      this.match<Option<E>>({
        Ok: none,
        Err: some,
      }),
    );
  }

  map<U>(fn: (val: T) => Promise<U> | U): AsyncResult<U, E> {
    return new AsyncResult(
      this.match({
        Ok: async (val: T): Promise<Result<U, E>> => ok(await fn(val)),
        Err: err,
      }),
    );
  }

  async mapOr<U>(
    defaultValue: U | Promise<U>,
    fn: (val: T) => U | Promise<U>,
  ): Promise<U> {
    return this.match({
      Ok: async (val) => await fn(val),
      Err: async () => await defaultValue,
    });
  }

  async mapOrElse<U>(
    defaultFn: (err: E) => U | Promise<U>,
    fn: (val: T) => U | Promise<U>,
  ): Promise<U> {
    return this.match({
      Ok: async (val) => await fn(val),
      Err: async (err) => await defaultFn(err),
    });
  }

  mapErr<F>(fn: (error: E) => F | Promise<F>): AsyncResult<T, F> {
    return new AsyncResult(
      this.match({
        Ok: ok,
        Err: async (error): Promise<Result<T, F>> => err(await fn(error)),
      }),
    );
  }

  inspect(fn: (val: T) => void | Promise<void>): AsyncResult<T, E> {
    return new AsyncResult(this.match({
      Ok: async (val) => {
        await fn(val);
        return ok(val);
      },
      Err: async (error): Promise<Result<T, E>> => err(error),
    }));
  }

  inspectErr(fn: (err: E) => void | Promise<void>): AsyncResult<T, E> {
    return new AsyncResult(this.match({
      Ok: async (val): Promise<Result<T, E>> => ok(val),
      Err: async (error) => {
        await (fn(error));
        return err(error);
      },
    }));
  }

  async *[Symbol.asyncIterator](): AsyncIteratorObject<T, void> {
    const res = await this.promise;

    if (res.isOk()) {
      yield res.unwrap();
    }
  }

  async unwrap(
    message: string = `Expected ok() but got err(${this})`,
  ): Promise<T> {
    return (await this.promise).unwrap(message);
  }

  async unwrapErr(
    message: string = `Expected error but got ok(${this})`,
  ): Promise<E> {
    return (await this.promise).unwrapErr(message);
  }

  and<U>(resultB: AsyncResult<U, E>): AsyncResult<U, E> {
    return new AsyncResult(this.match({
      Ok: () => resultB.getResult(),
      Err: err,
    }));
  }

  andThen<U>(fn: (val: T) => AsyncResult<U, E>): AsyncResult<U, E> {
    return new AsyncResult(this.match({
      Ok: (val) => fn(val).getResult(),
      Err: err,
    }));
  }

  chain<U, F>(fn: (value: T) => AsyncResult<U, F>): AsyncResult<U, E | F> {
    const okFn: (value: T) => Promise<Result<U, E | F>> = async (val: T) =>
      fn(val).getResult();

    return new AsyncResult(this.match({
      Ok: okFn,
      Err: err,
    }));
  }

  or<F>(resultB: AsyncResult<T, F>): AsyncResult<T, F> {
    return new AsyncResult(this.match({
      Ok: ok,
      Err: () => resultB.getResult(),
    }));
  }

  orElse<F>(fn: (err: E) => AsyncResult<T, F>): AsyncResult<T, F> {
    return new AsyncResult(this.match({
      Ok: ok,
      Err: (err) => fn(err).getResult(),
    }));
  }

  async unwrapOr(defaultValue: T): Promise<T> {
    return (await this.promise).unwrapOr(defaultValue);
  }

  async unwrapOrElse(fn: (err: E) => T | Promise<T>): Promise<T> {
    return this.match({
      Ok: (val) => val,
      Err: (error) => fn(error),
    });
  }

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

  toString(): string {
    return `[object AsyncResult]`;
  }

  get [Symbol.toStringTag](): string {
    return `AsyncResult`;
  }
}
