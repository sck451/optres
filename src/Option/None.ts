import { type Option, type Some, some } from "./Option.ts";
import { type Err, err } from "../Result/Result.ts";
import { UnwrapError } from "../UnwrapError/UnwrapError.ts";

/**
 * Construct a new {@link None} object
 * @returns a new None value
 * @typeParam T Type of the value the Option can contain
 */
export function none<T = never>(): None<T> {
  return new None();
}

/**
 * An object representing the absence of a value.
 *
 * @typeParam T Type of the value the Option can contain
 */
export class None<T = never> {
  /**
   * Test if the Option is a {@link Some} value.
   * @returns `true` if a `Some` value, `false` if a `None` value.
   */
  isSome(): this is Some<T> {
    return false;
  }

  /**
   * Check if the Option is a `Some` and a predicate passes.
   * @param fn Function to test the {@link Some} value.
   * @returns `true` if `Some` and predicate returns `true`, else `false`.
   */
  isSomeAnd(fn: (value: T) => boolean): false {
    return false;
  }

  /**
   * Check if the Option is a {@link None} value.
   * @returns `true` if `None`, `false` if `Some`.
   */
  isNone(): this is None {
    return true;
  }

  /**
   * Check if Option is a `None` or a predicate passes on {@link Some}.
   * @param fn Function to test the `Some` value.
   * @returns `true` if `None` or predicate returns `true`.
   */
  isNoneOr(fn: (value: T) => boolean): true {
    return true;
  }

  /**
   * Unwrap the value or throw an error if {@link None}.
   * @param message Optional error message if `None`.
   * @throws {UnwrapError}
   * @returns The unwrapped value of `Some`.
   */
  unwrap(message: string = "Called Option#unwrap on a None value"): T {
    throw new UnwrapError(message, null);
  }

  /**
   * Return the value or a provided default if {@link None}.
   * @param defaultValue Value to return if `None`.
   * @returns The `Some` value or `defaultValue`.
   */
  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  /**
   * Return the value or the result of a function if {@link None}.
   * @param fn Function producing fallback value.
   * @returns The `Some` value or result of `fn`.
   */
  unwrapOrElse(fn: () => T): T {
    return fn();
  }

  /**
   * Map a {@link Some} value to another with a function.
   * @param fn Function to apply to the value.
   * @returns A new {@link Option} with the mapped value or `None`.
   * @typeParam U The type that `map` will transform a `Some` value into
   */
  map<U>(fn: (value: T) => U): None<U> {
    return none();
  }

  /**
   * Run a function on the `Some` value for side effects.
   * @param fn Function to apply to the value.
   * @returns The original {@link Option}.
   */
  inspect(fn: (value: T) => void): None<T> {
    return this;
  }

  /**
   * Map a `Some` with a function, else return a default value.
   * @param defaultValue Value to return if `None`.
   * @param fn Function to map the value.
   * @returns Result of `fn` or `defaultValue`.
   * @typeParam U The type of the default value supplied for a None value and
   * the return value of the function supplied in the case of a Some value
   */
  mapOr<U>(defaultValue: U, fn: (val: T) => U): U {
    return defaultValue;
  }

  /**
   * Map a `Some` with a function, or use a default function.
   * @param defaultFn Function to produce fallback value.
   * @param fn Function to apply to the value.
   * @returns Result of `fn` or `defaultFn`.
   * @typeParam U The type returned by the callback for a None value and
   * the return value of the function for a Some value
   */
  mapOrElse<U>(defaultFn: () => U, someFn: (val: T) => U): U {
    return defaultFn();
  }

  /**
   * Convert the {@link Option} into a `Result`, mapping `Some` to
   * {@link Ok}.
   * @param err Error to use if `None`.
   * @returns An `Ok` if `Some`, or `Err` otherwise.
   * @typeParam E The type of the error that is provided if the Option is a
   * `None` value
   */
  okOr<E>(error: E): Err<T, E> {
    return err(error);
  }

  /**
   * Return an iterator over the {@link Some} value.
   * @returns A JavaScript iterator over 0 or 1 elements.
   */
  *[Symbol.iterator](): IteratorObject<T, void, never> {}

  /**
   * Return `optionB` if {@link Some}, otherwise `None`.
   * @param optionB Another option to return if `Some`.
   * @returns `optionB` if `Some`, else `None`.
   * @typeParam U The type of the value contained in `optionB`
   */
  and<U>(optionB: Option<U>): None<never> {
    return none();
  }

  /**
   * Chain another `Option`-producing function if {@link Some}.
   * @param fn Function to map the value to another `Option`.
   * @returns Result of `fn` if `Some`, else `None`.
   * @typeParam U The type of the value returned by the callback function
   */
  andThen<U>(fn: (value: T) => Option<U>): None<never> {
    return none();
  }

  /**
   * Keep {@link Some} if predicate passes, otherwise `None`.
   * @param fn Predicate function.
   * @returns `Some` if predicate returns `true`, else `None`.
   */
  filter(fn: (value: T) => boolean): None<never> {
    return none();
  }

  /**
   * Return self if {@link Some}, otherwise return `optionB`.
   * @param optionB Fallback {@link Some}.
   * @returns The original `Option` if `Some`, otherwise `optionB`.
   */
  or(optionB: Option<T>): Option<T> {
    return optionB;
  }

  /**
   * Return self if {@link Some}, otherwise compute an `Option` with a
   * function.
   * @param fn Function returning a fallback `Option`.
   * @returns The original `Option` if `Some`, or the result of `fn`.
   */
  orElse(fn: () => Option<T>): Option<T> {
    return fn();
  }

  /**
   * Exclusive OR: returns `Some` if exactly one of two is {@link Some}.
   * @param optionB Another option to compare.
   * @returns `Some` if exactly one input is `Some`, else `None`.
   */
  xor(optionB: Option<T>): Option<T> {
    return optionB.match<Option<T>>({
      Some: (valueB) => some(valueB),
      None: () => none(),
    });
  }

  /**
   * Zip two {@link Option}s into one `Option` of a tuple.
   * @param optionB The second option.
   * @returns `Some<[A, B]>` if both are `Some`, else `None`.
   * @typeParam U The type contained within `optionB`
   */
  zip<U>(optionB: Option<U>): None<never> {
    return none();
  }

  /**
   * Zip two {@link Option}s with a combining function.
   * @param optionB The second option.
   * @param fn Function to combine values.
   * @returns `Some(fn(a, b))` if both are `Some`, else `None`.
   * @typeParam U The type contained within `optionB`
   * @typeParam R The return type of the callback function if both `Option`s
   * are `Some` values
   */
  zipWith<U, R>(
    optionB: Option<U>,
    fn: (optA: T, optB: U) => R,
  ): None<never> {
    return none();
  }

  /**
   * Pattern match on the {@link Option}.
   * @param matcher Object with `Some` and `None` handler functions.
   * @returns Result of the matching function.
   * @typeParam R The type that must be returned by both callback functions.
   * If they need to be distinct types, the union of these types should be
   * supplied as an explicit type argument, e.g. `match<number, string>(...)`.
   */
  match<R>(matcher: {
    Some: (value: T) => R;
    None: () => R;
  }): R {
    return matcher.None();
  }

  /**
   * Get a string representation of the {@link Option}.
   * @returns `"Some(value)"` or `"None"`.
   */
  toString(): string {
    return "none";
  }

  /**
   * Sets the default string tag for the class.
   */
  get [Symbol.toStringTag](): string {
    return `None`;
  }
}
