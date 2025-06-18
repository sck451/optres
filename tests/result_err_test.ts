import { expect, fn } from "@std/expect";
import { err, ok, type Result } from "../main.ts";
import { UnwrapError } from "../src/UnwrapError/UnwrapError.ts";

Deno.test("err result is Err and not Ok", () => {
  const result = err(42);
  expect(result.isOk()).toBe(false);
  expect(result.isErr()).toBe(true);
});

Deno.test("err().isOkAnd(n) is false", () => {
  const a: Result<number, string> = err("error");

  const callBackReturnsTrue = fn(() => true);
  const callBackReturnsFalse = fn(() => false);

  expect(a.isOkAnd(() => callBackReturnsTrue())).toBe(false);
  expect(a.isOkAnd(() => callBackReturnsFalse())).toBe(false);
});

Deno.test("err().isErrAnd(n) returns n()", () => {
  const a: Result<number, string> = err("problem");

  expect(a.isErrAnd(() => true)).toBe(true);
  expect(a.isErrAnd(() => false)).toBe(false);
});

Deno.test("err().ok() returns none()", () => {
  const a = err("problem").ok();
  expect(a.isNone()).toBe(true);

  const b = err(undefined).ok();
  expect(b.isNone()).toBe(true);
});

Deno.test("err(n).err() returns some(n)", () => {
  const a = err("problem").err();
  expect(a.isSome()).toBe(true);
  expect(a.unwrap()).toBe("problem");

  const b = err(undefined).err();
  expect(b.isSome()).toBe(true);
  expect(b.unwrap()).toBe(undefined);
});

Deno.test("err().map() remains an error", () => {
  const a = err("problem").map((val) => String(val));
  expect(a.isErr()).toBe(true);
  expect(a.unwrapErr()).toBe("problem");
});

Deno.test("err().mapOr() returns correct value", () => {
  const a = err("problem").mapOr("21", (val) => String(val));
  expect(a).toBe("21");
});

Deno.test("err().mapOrElse() returns correct value", () => {
  const a = err("problem").mapOrElse((_err) => 21, (val) => val * 2);
  expect(a).toBe(21);
});

Deno.test("err().mapErr() transforms the error", () => {
  const a = err("problem").mapErr((err) => err.toUpperCase());
  expect(a.isErr()).toBe(true);
  expect(a.unwrapErr()).toBe("PROBLEM");
});

Deno.test("err.inspect() does not call its callback", () => {
  let called = false;
  const callback = () => {
    called = true;
  };

  err("problem").inspect(callback);
  expect(called).toBe(false);
});

Deno.test("ok.inspectErr() calls its callback", () => {
  let called = false;
  const callback = () => {
    called = true;
  };

  err("problem").inspectErr(callback);
  expect(called).toBe(true);
});

Deno.test({
  name: "iterating over err(e) yields nothing",
  fn: () => {
    const result = err("problem");

    const collected = [...result];
    expect(collected.length).toBe(0);
  },
});

Deno.test("err().unwrap() throws", () => {
  expect(() => err("problem").unwrap()).toThrow(UnwrapError);
});

Deno.test("err(n).unwrapErr() returns n", () => {
  expect(err("problem").unwrapErr()).toBe("problem");
});

Deno.test("err(n).and(b) returns err(n)", () => {
  const a: Result<number, string> = err("problem");
  const b = ok(84);
  const c = err("some");

  const d = a.and(b);
  const e = a.and(c);

  expect(d.isErr()).toBe(true);
  expect(d.unwrapErr()).toBe("problem");

  expect(e.isErr()).toBe(true);
  expect(e.unwrapErr()).toBe("problem");
});

Deno.test("err(n).andThen() returns err(n)", () => {
  const a = err("problem").andThen((val) => ok(String(val)));

  expect(a.isErr()).toBe(true);
  expect(a.unwrapErr()).toBe("problem");
});

Deno.test("err().chain() short-circuits", () => {
  const a: Result<number, string> = err<string>("oops").chain<number, boolean>(
    () => ok(42),
  );

  expect(a.isErr()).toBe(true);
  expect(a.unwrapErr()).toBe("oops");
});

Deno.test("err().or(n) returns n", () => {
  const a: Result<number, string> = err("problem");

  const b = a.or(ok(42));
  const c = a.or(err("bigger problem"));

  expect(b.isOk()).toBe(true);
  expect(b.unwrap()).toBe(42);

  expect(c.isOk()).toBe(false);
  expect(c.unwrapErr()).toBe("bigger problem");
});

Deno.test("err().orElse(n) returns n()", () => {
  const a: Result<number, string> = err("problem");

  const b = a.orElse((_err) => ok(42));
  const c = a.orElse((msg) => err(msg.toUpperCase()));

  expect(b.isOk()).toBe(true);
  expect(b.unwrap()).toBe(42);

  expect(c.isErr()).toBe(true);
  expect(c.unwrapErr()).toBe("PROBLEM");
});

Deno.test("err().unwrapOr(n) returns n", () => {
  const a: Result<number, string> = err("problem");
  expect(a.unwrapOr(84)).toBe(84);
});

Deno.test("err().unwrapOrElse(n) returns n()", () => {
  const a: Result<number, string> = err("problem");
  expect(a.unwrapOrElse((_err) => 42)).toBe(42);
});

Deno.test("err().match calls the Err branch", () => {
  const a: Result<number, number> = err(24);
  const result = a.match({
    Ok: (val) => val * 2,
    Err: (err) => err,
  });

  expect(result).toBe(24);
});

Deno.test("err().toString() formats result correctly", () => {
  expect(err("problem").toString()).toBe("err(problem)");
});
