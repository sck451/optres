import type { Err, Result } from "./Result.ts";
import { type None, none, type Some, some } from "../Option/Option.ts";
import { UnwrapError } from "../UnwrapError/UnwrapError.ts";

/**
 * Construct a new {@link Ok} object
 * @returns a new Ok value
 * @typeParam T The type of a `Ok` value
 * @typeParam E The type of an `Err` value. Note that this does not have to be
 * a Javascript Error value.
 */
export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

/**
 * An object representing the success of an operation.
 * @typeParam T The type of a `Ok` value
 * @typeParam E The type of an `Err` value. Note that this does not have to be
 * a Javascript Error value.
 */
export class Ok<T, E = never> {
  /**
   * Construct a new {@link Ok} object
   * @param value The success value of the Result
   */
  constructor(private readonly value: T) {}

  /**
   * Test if the Result is an {@link Ok} value.
   * @returns `true` if an `Ok` value, `false` if an `Err` value.
   */
  isOk(): this is Ok<T, E> {
    return true;
  }

  /**
   * Test if both the Result is an {@link Ok} and a predicate passes.
   * @param fn Function to test the `Ok` value.
   * @returns `true` if `Ok` and the test passes.
   */
  isOkAnd(fn: (val: T) => boolean): boolean {
    return fn(this.value);
  }

  /**
   * Test if the Result is an {@link Err} value.
   * @returns `true` if an `Err` value, `false` if an `Ok` value.
   */
  isErr(): this is Err<T, E> {
    return false;
  }

  /**
   * Test if the Result is an {@link Err} value and a test passes.
   * @param fn Function to test the `Err` error value.
   * @returns `true` if `Err` and the test passes.
   */
  isErrAnd(_fn: (err: E) => boolean): false {
    return false;
  }

  /**
   * Get an {@link Option} containing the `Ok` value if any.
   * @returns `Some(val)` if `Ok`, `None()` if `Err`.
   */
  ok(): Some<T> {
    return some(this.value);
  }

  /**
   * Get an {@link Option} containing the `Err` value if any.
   * @returns `Some(err)` if `Err`, `None()` if `Ok`.
   */
  err(): None {
    return none();
  }

  /**
   * Transform the contained `Ok` value with a function, if any.
   * @param fn Function to apply to the `Ok` value.
   * @returns A new `Result` with the function applied to the `Ok` value.
   * @typeParam U The type that `map` will transform an `Ok` value into
   */
  map<U>(fn: (val: T) => U): Ok<U, E> {
    return ok(fn(this.value));
  }

  /**
   * Transform the `Ok` value or return a default.
   * @param defaultValue Value to return if `Err`.
   * @param fn Function to apply to the `Ok` value.
   * @returns The result of `fn` if `Ok`, otherwise `defaultValue`.
   * @typeParam U The type of the `defaultValue` and of the return value of
   * the callback functions, which will then be returned by `mapOr`.
   */
  mapOr<U>(_defaultValue: U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Transform the `Ok` value or compute a default from the `Err` value.
   * @param defaultFn Function to compute default from `Err`.
   * @param fn Function to apply to the `Ok` value.
   * @returns Result of `fn` if `Ok`, otherwise result of `defaultFn`.
   * @typeParam U The return type of both callback functions, which will then
   * be returned by `mapOrElse`.
   */
  mapOrElse<U>(_defaultFn: (err: E) => U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Transform the contained `Err` value with a function, if any.
   * @param fn Function to apply to the `Err` value.
   * @returns A new `Result` with the function applied to the `Err` value.
   * @typeParam F The new error type of an `Err` value, which must be the return
   * type of the callback function `fn`.
   */
  mapErr<F>(_fn: (err: E) => F): Ok<T, F> {
    return ok(this.value);
  }

  /**
   * Run a side-effect function if the value is `Ok`, without changing the result.
   * @param fn Function to run on the `Ok` value.
   * @returns The original `Result`.
   */
  inspect(fn: (val: T) => void): Ok<T, E> {
    fn(this.value);
    return this;
  }

  /**
   * Run a side-effect function if the value is `Err`, without changing the result.
   * @param fn Function to run on the `Err` value.
   * @returns The original `Result`.
   */
  inspectErr(_fn: (err: E) => void): Ok<T, E> {
    return this;
  }

  /**
   * Get an iterator over the `Ok` value.
   * @returns An iterator yielding the `Ok` value or nothing if `Err`.
   */
  *[Symbol.iterator](): Iterator<T> {
    yield this.value;
  }

  /**
   * Unwrap the `Ok` value, or throw an error if `Err`.
   * @param message Optional custom message for the thrown error.
   * @throws If the value is `Err`.
   * @returns The `Ok` value.
   */
  unwrap(_message: string = `Expected ok() but got ${this}`): T {
    return this.value;
  }

  /**
   * Unwrap the `Err` value, or throw an error if `Ok`.
   * @param message Optional custom message for the thrown error.
   * @throws If the value is `Ok`.
   * @returns The `Err` value.
   */
  unwrapErr(message: string = `Expected error but got ${this}`): never {
    throw new UnwrapError(message, this.value);
  }

  /**
   * Return `resultB` if the result is `Ok`, otherwise return the `Err`.
   * @param resultB A new `Result` to return if `Ok`.
   * @returns `resultB` if `Ok`, otherwise the current `Err`.
   * @typeParam U The `Ok` type of `optionB`, which will also be the
   * `Ok` type of the returned `Option`.
   */
  and<U>(resultB: Result<U, E>): Result<U, E> {
    return resultB;
  }

  /**
   * Call `fn` if the result is `Ok`, otherwise return the `Err`.
   * @param fn Function to produce a new `Result` from the `Ok` value.
   * @returns Result of `fn` if `Ok`, otherwise the current `Err`.
   * @typeParam U The `Ok` type returned from the callback `fn`, which will
   * also be the `Ok` type of the returned `Option`.
   */
  andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  /**
   * Call `fn` if the Result is `Ok`, otherwise return the `Err`.
   * This allows the chaining of results, gathering all the possible
   * errors together while passing along a new value. It is the
   * closest equivalent to using the `!` operator in Rust.
   *
   * @param fn A function that receives the current value, and returns
   * a Result, merging the possible error types together.
   * @returns A new Result, combining the possible error types.
   * @typeParam U The `Ok` type returned by the callback `fn`, which will
   * also be the `Ok` type returned.
   * @typeParam F The `Err` type returned by the callback `fn`, which will
   * be added to a type union with {@link E} and be the `Err` type returned
   * by `chain`.
   */
  chain<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F> {
    return fn(this.value);
  }

  /**
   * Return the `Ok` value if present, otherwise return `resultB`.
   * @param resultB A new `Result` to return if `Err`.
   * @returns The current `Ok` or `resultB` if `Err`.
   * @typeParam F The `Err` type of `resultB`, which will be the Err type of
   * the `Result` returned by `or`.
   */
  or<F>(_resultB: Result<T, F>): Ok<T, F> {
    return ok(this.value);
  }

  /**
   * Call `fn` if the result is `Err`, otherwise return the `Ok`.
   * @param fn Function to produce a new `Result` from the `Err` value.
   * @returns Result of `fn` if `Err`, otherwise the current `Ok`.
   * @typeParam F The `Err` type of the `Result` returned by the callback `fn`,
   * which will be the Err type of the `Result` returned by `orElse`.
   */
  orElse<F>(_fn: (err: E) => Result<T, F>): Ok<T, F> {
    return ok(this.value);
  }

  /**
   * Unwrap the `Ok` value or return a default.
   * @param defaultValue Value to return if `Err`.
   * @returns The `Ok` value or `defaultValue` if `Err`.
   */
  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  /**
   * Unwrap the `Ok` value or compute a default from the `Err` value.
   * @param fn Function to compute a fallback value from `Err`.
   * @returns The `Ok` value or the result of `fn` if `Err`.
   */
  unwrapOrElse(_fn: (err: E) => T): T {
    return this.value;
  }

  /**
   * Pattern-match on the `Result` to extract or transform the value.
   * @param matcher Object with handlers for `Ok` and `Err` cases.
   * @returns Result of the appropriate handler.
   * @typeParam R The type that must be returned by both callback functions
   * and which will be the return type of `match`.
   */
  match<R>(matcher: {
    Ok: (val: T) => R;
    Err: (err: E) => R;
  }): R {
    return matcher.Ok(this.value);
  }

  /**
   * Convert the Result to a string representation.
   * @returns A string indicating `ok(val)` or `err(err)`.
   */
  toString(): string {
    return `ok(${this.value})`;
  }
}
