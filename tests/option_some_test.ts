import { expect, fn } from "@std/expect";
import { none, type Option, some } from "../main.ts";

Deno.test("some() is Some and not None", () => {
  const option = some(42);
  expect(option.isSome()).toBe(true);
  expect(option.isNone()).toBe(false);
});

Deno.test("some().isSomeAnd(n) returns n()", () => {
  const option = some(42).isSomeAnd((val) => val > 40);
  const resultB = some(42).isSomeAnd((val) => val > 50);

  expect(option).toBe(true);
  expect(resultB).toBe(false);
});

Deno.test("some().isNoneOr(n) returns n()", () => {
  const option = some(42);

  expect(option.isNoneOr((val) => val > 40)).toBe(true);
  expect(option.isNoneOr((val) => val < 40)).toBe(false);
});

Deno.test("some(n).unwrap() returns n", () => {
  const option = some(42);
  const undefinedResult = some(undefined);

  expect(option.unwrap()).toBe(42);
  expect(undefinedResult.unwrap()).toBe(undefined);
});

Deno.test("some(n).unwrapOr() returns n", () => {
  const option = some(42);

  expect(option.unwrapOr(84)).toBe(42);
});

Deno.test("some(n).unwrapOrElse() returns n", () => {
  expect(some(42).unwrapOrElse(() => 84)).toBe(42);
});

Deno.test("some(n).map() transforms n", () => {
  const option = some(42).map((num) => String(num));

  expect(option.isSome()).toBe(true);
  expect(option.unwrap()).toBe("42");
});

Deno.test("some().inspect(n) calls n", () => {
  const testFn = fn(
    (_val: number) => undefined,
  );

  const option = some(42).inspect(() => testFn());
  expect(option.isSome()).toBe(true);
  expect(option.unwrap()).toBe(42);
  expect(testFn).toHaveBeenCalled();
});

Deno.test("some(n).mapOr(d, f) returns g(n)", () => {
  const option = some(42).mapOr(21, (val) => val * 2);
  expect(option).toBe(84);
});

Deno.test("some(n).mapOrElse(f, g) returns g(n)", () => {
  const option = some(42).mapOrElse(() => 21, (val) => val * 2);
  expect(option).toBe(84);
});

Deno.test("some(n).okOr() returns ok(n)", () => {
  const option = some(42);
  const result = option.okOr("problem");

  expect(result.isOk()).toBe(true);
  expect(result.unwrap()).toBe(42);
});

Deno.test("iterating over some(n).iter() yields precisely n", () => {
  const collected = [...some(42)];
  expect(collected.length).toBe(1);
  expect(collected[0]).toBe(42);
});

Deno.test("some().and(n) returns n", () => {
  const option = some(42).and(some(84));
  const optionFail = some(42).and(none());

  expect(option.isSome()).toBe(true);
  expect(option.unwrap()).toBe(84);
  expect(optionFail.isNone()).toBe(true);
});

Deno.test("some(n).andThen(f) returns f(n)", () => {
  const option = some(42).andThen((val) => some(val * 2));
  const optionFail = some(42).andThen(() => none());

  expect(option.isSome()).toBe(true);
  expect(option.unwrap()).toBe(84);
  expect(optionFail.isNone()).toBe(true);
});

Deno.test("some(n).filter(f) returns some(n) if f is true and none() if it is false", () => {
  const option = some(42).filter((val) => val > 40);
  const optionFail = some(42).filter((val) => val > 50);

  expect(option.isSome()).toBe(true);
  expect(option.unwrap()).toBe(42);
  expect(optionFail.isNone()).toBe(true);
});

Deno.test("some(n).or() returns some(n)", () => {
  const option = some(42).or(some(84));
  const optionB = some(42).or(none());

  expect(option.isSome()).toBe(true);
  expect(option.unwrap()).toBe(42);
  expect(optionB.isSome()).toBe(true);
  expect(optionB.unwrap()).toBe(42);
});

Deno.test("some(n).orElse() returns some(n)", () => {
  const option = some(42).orElse(() => some(84));
  const optionB = some(42).orElse(() => none());

  expect(option.isSome()).toBe(true);
  expect(option.unwrap()).toBe(42);
  expect(optionB.isSome()).toBe(true);
  expect(optionB.unwrap()).toBe(42);
});

Deno.test("some().xor() does a proper XOR", () => {
  const option = some(42);

  expect(option.xor(some(84)).isSome()).toBe(false);
  expect(option.xor(none()).isSome()).toBe(true);
});

Deno.test("some().zip() zips appropriately", () => {
  const option = some(42);

  const optionWithZip = option.zip(some(84));
  const optionShouldFail = option.zip(none());

  expect(optionWithZip.isSome()).toBe(true);
  expect(optionWithZip.unwrap()[0]).toBe(42);
  expect(optionWithZip.unwrap()[1]).toBe(84);

  expect(optionShouldFail.isNone()).toBe(true);
});

Deno.test("some().zipWith() zips appropriately and runs the function", () => {
  const option = some(42);
  const add = (a: number, b: number) => a + b;

  const fail: Option<number> = none();

  const optionWithZip = option.zipWith(some(84), add);
  const optionShouldFail = option.zipWith(fail, add);

  expect(optionWithZip.isSome()).toBe(true);
  expect(optionWithZip.unwrap()).toBe(126);

  expect(optionShouldFail.isNone()).toBe(true);
});

Deno.test("some(n).match() matches correctly", () => {
  const option = some(42);
  const stringResult = option.match({
    Some: (val) => String(val),
    None: () => "Nothing",
  });

  expect(stringResult).toBe("42");
});

Deno.test("some().toString() should give a proper response", () => {
  const option = some(42);
  expect(String(option)).toBe("some(42)");
});
