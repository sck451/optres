import type { Ok, Result } from "./Result.ts";
import { type None, none, type Some, some } from "../Option/Option.ts";
import { ResultBase } from "./ResultBase.ts";
import { UnwrapError } from "../UnwrapError/UnwrapError.ts";

export function err<E>(error: E): Err<never, E> {
  return new Err(error);
}

export class Err<T = never, E = unknown> extends ResultBase<T, E> {
  constructor(private readonly error: E) {
    super();
  }

  isOk(): this is Ok<T, E> {
    return false;
  }

  isOkAnd(_fn: (val: T) => boolean): boolean {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  isErrAnd(fn: (err: E) => boolean): boolean {
    return fn(this.error);
  }

  ok(): None<T> {
    return none();
  }

  err(): Some<E> {
    return some(this.error);
  }

  map<U>(_fn: (val: T) => U): Err<never, E> {
    return err(this.error);
  }

  mapOr<U>(defaultValue: U, _fn: (val: T) => U): U {
    return defaultValue;
  }

  mapOrElse<U>(defaultFn: (err: E) => U, _fn: (val: T) => U): U {
    return defaultFn(this.error);
  }

  mapErr<F>(fn: (err: E) => F): Err<never, F> {
    return err(fn(this.error));
  }

  inspect(_fn: (val: T) => void): Err<never, E> {
    return err(this.error);
  }

  inspectErr(fn: (err: E) => void): Err<never, E> {
    fn(this.error);
    return err(this.error);
  }

  *[Symbol.iterator](): Iterator<T> {}

  unwrap(message: string = `Expected ok() but got ${this}`): never {
    throw new UnwrapError(message, this.error);
  }

  unwrapErr(_message: string = `Expected error but got ${this}`): E {
    return this.error;
  }

  and<U>(_resultB: Result<U, E>): Err<never, E> {
    return err(this.error);
  }

  andThen<U>(_fn: (val: T) => Result<U, E>): Err<never, E> {
    return err(this.error);
  }

  chain<U, F>(_fn: (value: T) => Result<U, F>): Err<never, E> {
    return err(this.error);
  }

  or<F>(resultB: Result<T, F>): Result<T, F> {
    return resultB;
  }

  orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F> {
    return fn(this.error);
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse(fn: (err: E) => T): T {
    return fn(this.error);
  }

  match<R>(matcher: {
    Ok: (val: T) => R;
    Err: (err: E) => R;
  }): R {
    return matcher.Err(this.error);
  }

  toString(): string {
    return `err(${this.error})`;
  }
}
