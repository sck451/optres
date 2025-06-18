import type { Err, Result } from "./Result.ts";
import { type None, none, type Some, some } from "../Option/Option.ts";
import { ResultBase } from "./ResultBase.ts";
import { UnwrapError } from "../UnwrapError/UnwrapError.ts";

export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

export class Ok<T, E = never> extends ResultBase<T, E> {
  constructor(private readonly value: T) {
    super();
  }

  isOk(): this is Ok<T, E> {
    return true;
  }

  isOkAnd(fn: (val: T) => boolean): boolean {
    return fn(this.value);
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  isErrAnd(_fn: (err: E) => boolean): false {
    return false;
  }

  ok(): Some<T> {
    return some(this.value);
  }

  err(): None {
    return none();
  }

  map<U>(fn: (val: T) => U): Ok<U, E> {
    return ok(fn(this.value));
  }

  mapOr<U>(_defaultValue: U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  mapOrElse<U>(_defaultFn: (err: E) => U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  mapErr<F>(_fn: (err: E) => F): Ok<T, F> {
    return ok(this.value);
  }

  inspect(fn: (val: T) => void): Ok<T, E> {
    fn(this.value);
    return this;
  }

  inspectErr(_fn: (err: E) => void): Ok<T, E> {
    return this;
  }

  *[Symbol.iterator](): Iterator<T> {
    yield this.value;
  }

  unwrap(_message: string = `Expected ok() but got ${this}`): T {
    return this.value;
  }

  unwrapErr(message: string = `Expected error but got ${this}`): never {
    throw new UnwrapError(message, this.value);
  }

  and<U>(resultB: Result<U, E>): Result<U, E> {
    return resultB;
  }

  andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  chain<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F> {
    return fn(this.value);
  }

  or<F>(_resultB: Result<T, F>): Ok<T, F> {
    return ok(this.value);
  }

  orElse<F>(_fn: (err: E) => Result<T, F>): Ok<T, F> {
    return ok(this.value);
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_fn: (err: E) => T): T {
    return this.value;
  }

  match<R>(matcher: {
    Ok: (val: T) => R;
    Err: (err: E) => R;
  }): R {
    return matcher.Ok(this.value);
  }

  toString(): string {
    return `ok(${this.value})`;
  }
}
