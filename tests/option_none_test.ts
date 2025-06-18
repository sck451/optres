import { expect, fn } from "@std/expect";
import { none, type Option, some } from "../main.ts";
import { UnwrapError } from "../src/UnwrapError/UnwrapError.ts";

Deno.test("none() is None and not Some", () => {
  const option = none();
  expect(option.isSome()).toBe(false);
  expect(option.isNone()).toBe(true);
});

Deno.test("none().isSomeAnd(n) returns false", () => {
  const option: Option<number> = none();

  expect(option.isSomeAnd((val) => val > 40)).toBe(false);
  expect(option.isSomeAnd((val) => val > 50)).toBe(false);
});

Deno.test("none().isNoneOr(n) returns true", () => {
  const option: Option<number> = none();

  expect(option.isNoneOr((val) => val > 40)).toBe(true);
  expect(option.isNoneOr((val) => val < 40)).toBe(true);
});

Deno.test("none().unwrap() throws", () => {
  const option: Option<number> = none();

  expect(() => option.unwrap()).toThrow(UnwrapError);
});

Deno.test("none().unwrapOr(n) returns n", () => {
  const option: Option<number> = none();

  expect(option.unwrapOr(42)).toBe(42);
});

Deno.test("none().unwrapOrElse(n) returns n()", () => {
  expect(none<number>().unwrapOrElse(() => 42)).toBe(42);
});

Deno.test("none().map() returns none()", () => {
  const option: Option<number> = none();
  const mapped = option.map((num) => String(num));

  expect(mapped.isNone()).toBe(true);
});

Deno.test("none().inspect(n) does not call n", () => {
  const testFn = fn(
    (_val: number) => undefined,
  );

  const option = none().inspect(() => testFn());
  expect(option.isNone()).toBe(true);
  expect(testFn).not.toHaveBeenCalled();
});

Deno.test("none().mapOr(d, f) returns d", () => {
  const option: Option<number> = none();
  expect(option.mapOr(42, (val) => val * 2)).toBe(42);
});

Deno.test("none().mapOrElse(f, g) returns f()", () => {
  const option: Option<number> = none();

  expect(option.mapOrElse(() => 42, (val) => val * 2)).toBe(42);
});

Deno.test("none().okOr(n) returns err(n)", () => {
  const option: Option<number> = none();
  const result = option.okOr("problem");

  expect(result.isErr()).toBe(true);
  expect(result.unwrapErr()).toBe("problem");
});

Deno.test("iterating over none().iter() yields nothing", () => {
  const collected = [...none()];
  expect(collected.length).toBe(0);
});

Deno.test("none().and() returns none()", () => {
  const option = none().and(some(84));
  const optionFail = none().and(none());

  expect(option.isNone()).toBe(true);
  expect(optionFail.isNone()).toBe(true);
});

Deno.test("none().andThen() returns none()", () => {
  const option: Option<number> = none();

  const optionWithSome = option.andThen((val) => some(val * 2));
  const optionWithNone = some(42).andThen(() => none());

  expect(optionWithSome.isNone()).toBe(true);
  expect(optionWithNone.isNone()).toBe(true);
});

Deno.test("none().filter(f) returns none() and does not call the function", () => {
  const option: Option<number> = none();
  const callback = fn((_val: number) => true);

  const result = option.filter((val) => callback(val));
  expect(callback).not.toBeCalled();
});

Deno.test("none().or(n) returns n", () => {
  const optionNone: Option<number> = none();

  const optionWithSome = optionNone.or(some(42));
  const optionWithNone = optionNone.or(none());

  expect(optionWithSome.isSome()).toBe(true);
  expect(optionWithSome.unwrap()).toBe(42);
  expect(optionWithNone.isNone()).toBe(true);
});

Deno.test("none.orElse(n) returns n()", () => {
  const optionNone: Option<number> = none();

  const optionOrSome = optionNone.orElse(() => some(42));
  const optionOrNone = optionNone.orElse(() => none());

  expect(optionOrSome.isSome()).toBe(true);
  expect(optionOrSome.unwrap()).toBe(42);
  expect(optionOrNone.isNone()).toBe(true);
});

Deno.test("some().xor() does a proper XOR", () => {
  const optionNone: Option<number> = none();

  expect(optionNone.xor(some(84)).isSome()).toBe(true);
  expect(optionNone.xor(none()).isSome()).toBe(false);
});

Deno.test("none().zip() returns none()", () => {
  const optionNone: Option<number> = none();

  const optionWithSome = optionNone.zip(some(84));
  const optionWithNone = optionNone.zip(none());

  expect(optionWithSome.isNone()).toBe(true);
  expect(optionWithNone.isNone()).toBe(true);
});

Deno.test("none().zipWith() returns none()", () => {
  const optionNone: Option<number> = none();
  const add = (a: number, b: number) => a + b;

  const optionWithZip = optionNone.zipWith(some(42), add);
  const optionShouldFail = optionNone.zipWith(optionNone, add);

  expect(optionWithZip.isNone()).toBe(true);
  expect(optionShouldFail.isNone()).toBe(true);
});

Deno.test("none.match() matches correctly", () => {
  const optionNone: Option<number> = none();
  const stringResult = optionNone.match({
    Some: (val) => String(val),
    None: () => "Nothing",
  });

  expect(stringResult).toBe("Nothing");
});

Deno.test("some().toString() should give a proper response", () => {
  const optionNone: Option<number> = none();
  expect(String(optionNone)).toBe("none");
});
