import type { Result } from "../Result/Result.ts";
import type { None, Option, Some } from "./Option.ts";

/**
 * An object representing a value that may or may not be present. A {@link Some}
 * value signifies the presence of a value. A {@link None} value signifies its
 * absence.
 */
export abstract class OptionBase<T> {
  /**
   * Test if the Option is a {@link Some} value.
   * @returns `true` if a `Some` value, `false` if a `None` value.
   */
  abstract isSome(): this is Some<T>;

  /**
   * Check if the Option is a `Some` and a predicate passes.
   * @param fn Function to test the {@link Some} value.
   * @returns `true` if `Some` and predicate returns `true`, else `false`.
   */
  abstract isSomeAnd(fn: (value: T) => boolean): boolean;

  /**
   * Check if the Option is a {@link None} value.
   * @returns `true` if `None`, `false` if `Some`.
   */
  abstract isNone(): this is None;

  /**
   * Check if Option is a `None` or a predicate passes on {@link Some}.
   * @param fn Function to test the `Some` value.
   * @returns `true` if `None` or predicate returns `true`.
   */
  abstract isNoneOr(fn: (value: T) => boolean): boolean;

  /**
   * Unwrap the value or throw an error if {@link None}.
   * @param message Optional error message if `None`.
   * @throws {Error}
   * @returns The unwrapped value of `Some`.
   */
  abstract unwrap(message?: string): T;

  /**
   * Return the value or a provided default if {@link None}.
   * @param defaultValue Value to return if `None`.
   * @returns The `Some` value or `defaultValue`.
   */
  abstract unwrapOr(defaultValue: T): T;

  /**
   * Return the value or the result of a function if {@link None}.
   * @param fn Function producing fallback value.
   * @returns The `Some` value or result of `fn`.
   */
  abstract unwrapOrElse(fn: () => T): T;

  /**
   * Map a {@link Some} value to another with a function.
   * @param fn Function to apply to the value.
   * @returns A new {@link Option} with the mapped value or `None`.
   */
  abstract map<U>(fn: (value: T) => U): Option<U>;

  /**
   * Run a function on the `Some` value for side effects.
   * @param fn Function to apply to the value.
   * @returns The original {@link Option}.
   */
  abstract inspect(fn: (value: T) => void): Option<T>;

  /**
   * Map a `Some` with a function, else return a default value.
   * @param defaultValue Value to return if `None`.
   * @param fn Function to map the value.
   * @returns Result of `fn` or `defaultValue`.
   */
  abstract mapOr<U>(defaultValue: U, fn: (val: T) => U): U;

  /**
   * Map a `Some` with a function, or use a default function.
   * @param defaultFn Function to produce fallback value.
   * @param fn Function to apply to the value.
   * @returns Result of `fn` or `defaultFn`.
   */
  abstract mapOrElse<U>(defaultFn: () => U, fn: (val: T) => U): U;

  /**
   * Convert the {@link Option} into a `Result`, mapping `Some` to
   * {@link Ok}.
   * @param err Error to use if `None`.
   * @returns An `Ok` if `Some`, or `Err` otherwise.
   */
  abstract okOr<E>(err: E): Result<T, E>;

  /**
   * Return an iterator over the {@link Some} value.
   * @returns A JavaScript iterator over 0 or 1 elements.
   */
  abstract [Symbol.iterator](): Iterator<T>;

  /**
   * Return `optionB` if {@link Some}, otherwise `None`.
   * @param optionB Another option to return if `Some`.
   * @returns `optionB` if `Some`, else `None`.
   */
  abstract and<U>(optionB: Option<U>): Option<U>;

  /**
   * Chain another `Option`-producing function if {@link Some}.
   * @param fn Function to map the value to another `Option`.
   * @returns Result of `fn` if `Some`, else `None`.
   */
  abstract andThen<U>(fn: (value: T) => Option<U>): Option<U>;

  /**
   * Keep {@link Some} if predicate passes, otherwise `None`.
   * @param fn Predicate function.
   * @returns `Some` if predicate returns `true`, else `None`.
   */
  abstract filter(fn: (value: T) => boolean): Option<T>;

  /**
   * Return self if {@link Some}, otherwise return `optionB`.
   * @param optionB Fallback {@link Some}.
   * @returns The original `Option` if `Some`, otherwise `optionB`.
   */
  abstract or(optionB: Option<T>): Option<T>;

  /**
   * Return self if {@link Some}, otherwise compute an `Option` with a
   * function.
   * @param fn Function returning a fallback `Option`.
   * @returns The original `Option` if `Some`, or the result of `fn`.
   */
  abstract orElse(fn: () => Option<T>): Option<T>;

  /**
   * Exclusive OR: returns `Some` if exactly one of two is {@link Some}.
   * @param optionB Another option to compare.
   * @returns `Some` if exactly one input is `Some`, else `None`.
   */
  abstract xor(optionB: Option<T>): Option<T>;

  /**
   * Zip two {@link Option}s into one `Option` of a tuple.
   * @param optionB The second option.
   * @returns `Some<[A, B]>` if both are `Some`, else `None`.
   */
  abstract zip<U>(optionB: Option<U>): Option<[T, U]>;

  /**
   * Zip two {@link Option}s with a combining function.
   * @param optionB The second option.
   * @param fn Function to combine values.
   * @returns `Some(fn(a, b))` if both are `Some`, else `None`.
   */
  abstract zipWith<U, R>(
    optionB: Option<U>,
    fn: (optA: T, optB: U) => R,
  ): Option<R>;

  /**
   * Pattern match on the {@link Option}.
   * @param matcher Object with `Some` and `None` handler functions.
   * @returns Result of the matching function.
   */
  abstract match<R>(matcher: {
    Some: (value: T) => R;
    None: () => R;
  }): R;

  /**
   * Get a string representation of the {@link Option}.
   * @returns `"Some(value)"` or `"None"`.
   */
  abstract toString(): string;
}
