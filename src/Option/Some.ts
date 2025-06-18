import { type None, none, type Option } from "./Option.ts";
import { type Ok, ok } from "../Result/Result.ts";
import type { OptionBase } from "./OptionBase.ts";

export function some<T>(value: T): Some<T> {
  return new Some(value);
}

export class Some<T> implements OptionBase<T> {
  constructor(private readonly value: T) {}

  isSome(): this is Some<T> {
    return true;
  }

  isSomeAnd(fn: (value: T) => boolean): boolean {
    return fn(this.value);
  }

  isNone(): this is None {
    return false;
  }

  isNoneOr(fn: (value: T) => boolean): boolean {
    return fn(this.value);
  }

  unwrap(_message: string = ""): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_fn: () => T): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Some<U> {
    return some(fn(this.value));
  }

  inspect(fn: (value: T) => void): Some<T> {
    fn(this.value);

    return this;
  }

  mapOr<U>(_defaultValue: U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  mapOrElse<U>(_defaultFn: () => U, someFn: (val: T) => U): U {
    return someFn(this.value);
  }

  okOr<E>(_err: E): Ok<T, E> {
    return ok(this.value);
  }

  *[Symbol.iterator](): Iterator<T> {
    yield this.value;
  }

  and<U>(optionB: Option<U>): Option<U> {
    return optionB;
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  filter(fn: (value: T) => boolean): Option<T> {
    if (fn(this.value)) {
      return some(this.value);
    } else {
      return none();
    }
  }

  or(_optionB: Option<T>): Some<T> {
    return this;
  }

  orElse(_fn: () => Option<T>): Some<T> {
    return this;
  }

  xor(optionB: Option<T>): Option<T> {
    return optionB.match<Option<T>>({
      Some: () => none(),
      None: () => some(this.value),
    });
  }

  zip<U>(optionB: Option<U>): Option<[T, U]> {
    return optionB.match<Option<[T, U]>>({
      Some: (valueB) => some([this.value, valueB]),
      None: () => none(),
    });
  }

  zipWith<U, R>(optionB: Option<U>, fn: (optA: T, optB: U) => R): Option<R> {
    return optionB.match<Option<R>>({
      Some: (valueB) => some(fn(this.value, valueB)),
      None: () => none(),
    });
  }

  match<R>(matcher: {
    Some: (value: T) => R;
    None: () => R;
  }): R {
    return matcher.Some(this.value);
  }

  toString(): string {
    return `some(${this.value})`;
  }
}
