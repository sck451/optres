import type { Option } from "../Option/Option.ts";
import type { Err, Ok, Result } from "./Result.ts";

/**
 * An object representing success or failure. A {@link Ok} value signifies
 * success. A {@link Err} value signifies an error state.
 */
export abstract class ResultBase<T, E = unknown> {
  /**
   * Test if the Result is an {@link Ok} value.
   * @returns `true` if an `Ok` value, `false` if an `Err` value.
   */
  abstract isOk(): this is Ok<T, E>;

  /**
   * Test if both the Result is an {@link Ok} and a predicate passes.
   * @param fn Function to test the `Ok` value.
   * @returns `true` if `Ok` and the test passes.
   */
  abstract isOkAnd(fn: (value: T) => boolean): boolean;

  /**
   * Test if the Result is an {@link Err} value.
   * @returns `true` if an `Err` value, `false` if an `Ok` value.
   */
  abstract isErr(): this is Err<T, E>;

  /**
   * Test if the Result is an {@link Err} value and a test passes.
   * @param fn Function to test the `Err` error value.
   * @returns `true` if `Err` and the test passes.
   */
  abstract isErrAnd(fn: (error: E) => boolean): boolean;

  /**
   * Get an {@link Option} containing the `Ok` value if any.
   * @returns `Some(val)` if `Ok`, `None()` if `Err`.
   */
  abstract ok(): Option<T>;

  /**
   * Get an {@link Option} containing the `Err` value if any.
   * @returns `Some(err)` if `Err`, `None()` if `Ok`.
   */
  abstract err(): Option<E>;

  /**
   * Transform the contained `Ok` value with a function, if any.
   * @param fn Function to apply to the `Ok` value.
   * @returns A new `Result` with the function applied to the `Ok` value.
   */
  abstract map<U>(fn: (value: T) => U): Result<U, E>;

  /**
   * Transform the `Ok` value or return a default.
   * @param defaultValue Value to return if `Err`.
   * @param fn Function to apply to the `Ok` value.
   * @returns The result of `fn` if `Ok`, otherwise `defaultValue`.
   */
  abstract mapOr<U>(defaultValue: U, fn: (val: T) => U): U;

  /**
   * Transform the `Ok` value or compute a default from the `Err` value.
   * @param defaultFn Function to compute default from `Err`.
   * @param fn Function to apply to the `Ok` value.
   * @returns Result of `fn` if `Ok`, otherwise result of `defaultFn`.
   */
  abstract mapOrElse<U>(defaultFn: (error: E) => U, fn: (value: T) => U): U;

  /**
   * Transform the contained `Err` value with a function, if any.
   * @param fn Function to apply to the `Err` value.
   * @returns A new `Result` with the function applied to the `Err` value.
   */
  abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;

  /**
   * Run a side-effect function if the value is `Ok`, without changing the result.
   * @param fn Function to run on the `Ok` value.
   * @returns The original `Result`.
   */
  abstract inspect(fn: (value: T) => void): Result<T, E>;

  /**
   * Run a side-effect function if the value is `Err`, without changing the result.
   * @param fn Function to run on the `Err` value.
   * @returns The original `Result`.
   */
  abstract inspectErr(fn: (error: E) => void): Result<T, E>;

  /**
   * Get an iterator over the `Ok` value.
   * @returns An iterator yielding the `Ok` value or nothing if `Err`.
   */
  abstract [Symbol.iterator](): Iterator<T>;

  /**
   * Unwrap the `Ok` value, or throw an error if `Err`.
   * @param message Optional custom message for the thrown error.
   * @throws If the value is `Err`.
   * @returns The `Ok` value.
   */
  abstract unwrap(message?: string): T;

  /**
   * Unwrap the `Err` value, or throw an error if `Ok`.
   * @param message Optional custom message for the thrown error.
   * @throws If the value is `Ok`.
   * @returns The `Err` value.
   */
  abstract unwrapErr(message?: string): E;

  /**
   * Return `resultB` if the result is `Ok`, otherwise return the `Err`.
   * @param resultB A new `Result` to return if `Ok`.
   * @returns `resultB` if `Ok`, otherwise the current `Err`.
   */
  abstract and<U>(resultB: Result<U, E>): Result<U, E>;

  /**
   * Call `fn` if the result is `Ok`, otherwise return the `Err`.
   * @param fn Function to produce a new `Result` from the `Ok` value.
   * @returns Result of `fn` if `Ok`, otherwise the current `Err`.
   */
  abstract andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E>;

  /**
   * Call `fn` if the Result is `Ok`, otherwise return the `Err`.
   * This allows the chaining of results, gathering all the possible
   * errors together while passing along a new value.
   * @param fn A function that receives the current value, and returns
   * a Result, merging the possible error types together.
   * @returns A new Result, combining the possible error types.
   */
  abstract chain<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F>;

  /**
   * Return the `Ok` value if present, otherwise return `resultB`.
   * @param resultB A new `Result` to return if `Err`.
   * @returns The current `Ok` or `resultB` if `Err`.
   */
  abstract or<F>(resultB: Result<T, F>): Result<T, F>;

  /**
   * Call `fn` if the result is `Err`, otherwise return the `Ok`.
   * @param fn Function to produce a new `Result` from the `Err` value.
   * @returns Result of `fn` if `Err`, otherwise the current `Ok`.
   */
  abstract orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F>;

  /**
   * Unwrap the `Ok` value or return a default.
   * @param defaultValue Value to return if `Err`.
   * @returns The `Ok` value or `defaultValue` if `Err`.
   */
  abstract unwrapOr(defaultValue: T): T;

  /**
   * Unwrap the `Ok` value or compute a default from the `Err` value.
   * @param fn Function to compute a fallback value from `Err`.
   * @returns The `Ok` value or the result of `fn` if `Err`.
   */
  abstract unwrapOrElse(fn: (error: E) => T): T;

  /**
   * Pattern-match on the `Result` to extract or transform the value.
   * @param matcher Object with handlers for `Ok` and `Err` cases.
   * @returns Result of the appropriate handler.
   */
  abstract match<R>(matcher: {
    Ok: (value: T) => R;
    Err: (error: E) => R;
  }): R;

  /**
   * Convert the Result to a string representation.
   * @returns A string indicating `Ok(val)` or `Err(err)`.
   */
  abstract toString(): string;
}
