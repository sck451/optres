import { expect } from "@std/expect";
import { err, ok, type Result } from "../main.ts";
import { UnwrapError } from "../src/UnwrapError/UnwrapError.ts";

Deno.test("OK result is Ok and not Err", () => {
  const result = ok(42);
  expect(result.isOk()).toBe(true);
  expect(result.isErr()).toBe(false);
});

Deno.test("ok().isOkAnd(n) is n", () => {
  const a: Result<number, string> = ok(42);
  const b: Result<string, string> = ok("hello");
  const c: Result<number, string> = err("error");

  expect(a.and(b).isOk()).toBe(true);
  expect(a.and(c).isOk()).toBe(false);
});

Deno.test("ok().isErrAnd() is false", () => {
  const a: Result<number, string> = ok(42);

  expect(a.isErrAnd(() => true)).toBe(false);
  expect(a.isErrAnd(() => false)).toBe(false);
});

Deno.test("ok(n).ok() returns some(n)", () => {
  const a = ok(42).ok();
  expect(a.isSome()).toBe(true);
  expect(a.unwrap()).toBe(42);

  const b = ok(undefined).ok();
  expect(a.isSome()).toBe(true);
  expect(b.unwrap()).toBe(undefined);
});

Deno.test("ok().err() returns none()", () => {
  const a = ok(42).err();
  expect(a.isNone()).toBe(true);

  const b = ok(undefined).err();
  expect(b.isNone()).toBe(true);
});

Deno.test("ok().map() returns correct value", () => {
  const a = ok(42).map((val) => String(val));
  expect(a.unwrap()).toBe("42");
});

Deno.test("ok().mapOr() returns correct value", () => {
  const a = ok(42).mapOr("21", (val) => String(val));
  expect(a).toBe("42");
});

Deno.test("ok().mapOrElse() returns correct value", () => {
  const a = ok(42).mapOrElse((_err) => 21, (val) => val * 2);
  expect(a).toBe(84);
});

Deno.test("ok().mapErr() remains unchanged", () => {
  const a = ok(42).mapErr((_err) => false);
  expect(a.isOk()).toBe(true);
  expect(a.unwrap()).toBe(42);
});

Deno.test("ok.inspect() calls its callback", () => {
  let called = false;
  const callback = () => {
    called = true;
  };

  ok(42).inspect(callback);
  expect(called).toBe(true);
});

Deno.test("ok.inspectErr() does not call its callback", () => {
  let called = false;
  const callback = () => {
    called = true;
  };

  ok(42).inspectErr(callback);
  expect(called).toBe(false);
});

Deno.test("iterating over ok(n) yields precisely n", () => {
  const collected = [...ok(42)];
  expect(collected.length).toBe(1);
  expect(collected[0]).toBe(42);
});

Deno.test("ok(n).unwrap() returns n", () => {
  expect(ok(42).unwrap()).toBe(42);
});

Deno.test("ok().unwrapErr() throws", () => {
  expect(() => ok(42).unwrapErr()).toThrow(UnwrapError);
});

Deno.test("ok().and(b) returns b", () => {
  const a: Result<number, string> = ok(42);
  const b = ok(84);
  const c = err("some");

  expect(a.and(b)).toBe(b);
  expect(a.and(c)).toBe(c);
});

Deno.test("ok().andThen() returns correct value", () => {
  const a = ok(42).andThen((val) => ok(String(val)));

  expect(a.isOk()).toBe(true);
  expect(a.unwrap()).toBe("42");
});

Deno.test("ok().chain() returns correct value", () => {
  const a = ok(42).chain((val) => ok(String(val)));

  expect(a.isOk()).toBe(true);
  expect(a.unwrap()).toBe("42");
});

Deno.test("ok().chain() returns new Err if function returns Err", () => {
  const a = ok(42).chain((val) => err<string>(String(val)));

  expect(a.isErr()).toBe(true);
  expect(a.unwrapErr()).toBe("42");
});

Deno.test("ok(n).or() returns ok(n)", () => {
  const a = ok(42).or(ok(84));
  expect(a.isOk()).toBe(true);
  expect(a.unwrap()).toBe(42);

  const b = ok(42).or(err("problem"));
  expect(b.isOk()).toBe(true);
  expect(b.unwrap()).toBe(42);
});

Deno.test("ok(n).orElse returns ok(n)", () => {
  const a = ok(42).orElse((_err) => ok(84));
  expect(a.isOk()).toBe(true);
  expect(a.unwrap()).toBe(42);

  const b = ok(42).orElse((_err) => err("problem"));
  expect(b.isOk()).toBe(true);
  expect(b.unwrap()).toBe(42);
});

Deno.test("ok(n).unwrapOr() returns n", () => {
  expect(ok(42).unwrapOr(84)).toBe(42);
});

Deno.test("ok(n).unwrapOrElse() returns n", () => {
  expect(ok(42).unwrapOrElse((_err) => 84)).toBe(42);
});

Deno.test("ok().match calls the Ok branch", () => {
  const result = ok(42).match({
    Ok: () => 84,
    Err: () => 21,
  });

  expect(result).toBe(84);
});

Deno.test("ok().toString() formats result correctly", () => {
  expect(ok(42).toString()).toBe("ok(42)");
});
