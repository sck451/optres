import { type None, none, type Option } from "./Option.ts";
import { type Ok, ok } from "../Result/Result.ts";

/**
 * Construct a new {@link Some} object
 *
 * @param value The value the `Some` object contains
 * @returns The new `Some` object
 * @typeParam T Type of the value the Option can contain
 */
export function some<T>(value: T): Some<T> {
  return new Some(value);
}

/**
 * An object representing a value that is present.
 *
 * @typeParam T Type of the value the Option can contain
 */
export class Some<T> {
  /**
   * Construct a new {@link Some} object
   * @param value The value of the Some
   */
  constructor(private readonly value: T) {}

  /**
   * Test if the Option is a {@link Some} value.
   * @returns `true` if a `Some` value, `false` if a `None` value.
   */
  isSome(): this is Some<T> {
    return true;
  }

  /**
   * Check if the Option is a `Some` and a predicate passes.
   * @param fn Function to test the {@link Some} value.
   * @returns `true` if `Some` and predicate returns `true`, else `false`.
   */
  isSomeAnd(fn: (value: T) => boolean): boolean {
    return fn(this.value);
  }

  /**
   * Check if the Option is a {@link None} value.
   * @returns `true` if `None`, `false` if `Some`.
   */
  isNone(): this is None {
    return false;
  }

  /**
   * Check if Option is a `None` or a predicate passes on {@link Some}.
   * @param fn Function to test the `Some` value.
   * @returns `true` if `None` or predicate returns `true`.
   */
  isNoneOr(fn: (value: T) => boolean): boolean {
    return fn(this.value);
  }

  /**
   * Unwrap the value or throw an error if {@link None}.
   * @param message Optional error message if `None`.
   * @throws {Error}
   * @returns The unwrapped value of `Some`.
   */
  unwrap(_message: string = ""): T {
    return this.value;
  }

  /**
   * Return the value or a provided default if {@link None}.
   * @param defaultValue Value to return if `None`.
   * @returns The `Some` value or `defaultValue`.
   */
  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  /**
   * Return the value or the result of a function if {@link None}.
   * @param fn Function producing fallback value.
   * @returns The `Some` value or result of `fn`.
   */
  unwrapOrElse(_fn: () => T): T {
    return this.value;
  }

  /**
   * Map a {@link Some} value to another with a function.
   * @param fn Function to apply to the value.
   * @returns A new {@link Option} with the mapped value or `None`.
   * @typeParam U The type that `map` will transform a `Some` value into
   */
  map<U>(fn: (value: T) => U): Some<U> {
    return some(fn(this.value));
  }

  /**
   * Run a function on the `Some` value for side effects.
   * @param fn Function to apply to the value.
   * @returns The original {@link Option}.
   */
  inspect(fn: (value: T) => void): Some<T> {
    fn(this.value);

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
  mapOr<U>(_defaultValue: U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Map a `Some` with a function, or use a default function.
   * @param defaultFn Function to produce fallback value.
   * @param fn Function to apply to the value.
   * @returns Result of `fn` or `defaultFn`.
   * @typeParam U The type returned by the callback for a None value and
   * the return value of the function for a Some value
   */
  mapOrElse<U>(_defaultFn: () => U, someFn: (val: T) => U): U {
    return someFn(this.value);
  }

  /**
   * Convert the {@link Option} into a `Result`, mapping `Some` to
   * {@link Ok}.
   * @param err Error to use if `None`.
   * @returns An `Ok` if `Some`, or `Err` otherwise.
   * @typeParam E The type of the error that is provided if the Option is a
   * `None` value
   */
  okOr<E>(_err: E): Ok<T, E> {
    return ok(this.value);
  }

  /**
   * Return an iterator over the {@link Some} value.
   * @returns A JavaScript iterator over 0 or 1 elements.
   */
  *[Symbol.iterator](): Iterator<T> {
    yield this.value;
  }

  /**
   * Return `optionB` if {@link Some}, otherwise `None`.
   * @param optionB Another option to return if `Some`.
   * @returns `optionB` if `Some`, else `None`.
   * @typeParam U The type of the value contained in `optionB`
   */
  and<U>(optionB: Option<U>): Option<U> {
    return optionB;
  }

  /**
   * Chain another `Option`-producing function if {@link Some}.
   * @param fn Function to map the value to another `Option`.
   * @returns Result of `fn` if `Some`, else `None`.
   * @typeParam U The type of the value returned by the callback function
   */
  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  /**
   * Keep {@link Some} if predicate passes, otherwise `None`.
   * @param fn Predicate function.
   * @returns `Some` if predicate returns `true`, else `None`.
   */
  filter(fn: (value: T) => boolean): Option<T> {
    if (fn(this.value)) {
      return some(this.value);
    } else {
      return none();
    }
  }

  /**
   * Return self if {@link Some}, otherwise return `optionB`.
   * @param optionB Fallback {@link Some}.
   * @returns The original `Option` if `Some`, otherwise `optionB`.
   */
  or(_optionB: Option<T>): Some<T> {
    return this;
  }

  /**
   * Return self if {@link Some}, otherwise compute an `Option` with a
   * function.
   * @param fn Function returning a fallback `Option`.
   * @returns The original `Option` if `Some`, or the result of `fn`.
   */
  orElse(_fn: () => Option<T>): Some<T> {
    return this;
  }

  /**
   * Exclusive OR: returns `Some` if exactly one of two is {@link Some}.
   * @param optionB Another option to compare.
   * @returns `Some` if exactly one input is `Some`, else `None`.
   */
  xor(optionB: Option<T>): Option<T> {
    return optionB.match<Option<T>>({
      Some: () => none(),
      None: () => some(this.value),
    });
  }

  /**
   * Zip two {@link Option}s into one `Option` of a tuple.
   * @param optionB The second option.
   * @returns `Some<[A, B]>` if both are `Some`, else `None`.
   * @typeParam U The type contained within `optionB`
   */
  zip<U>(optionB: Option<U>): Option<[T, U]> {
    return optionB.match<Option<[T, U]>>({
      Some: (valueB) => some([this.value, valueB]),
      None: () => none(),
    });
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
  zipWith<U, R>(optionB: Option<U>, fn: (optA: T, optB: U) => R): Option<R> {
    return optionB.match<Option<R>>({
      Some: (valueB) => some(fn(this.value, valueB)),
      None: () => none(),
    });
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
    return matcher.Some(this.value);
  }

  /**
   * Get a string representation of the {@link Option}.
   * @returns `"Some(value)"` or `"None"`.
   */
  toString(): string {
    return `some(${this.value})`;
  }
}
