# optres

This package provides utilities for working with the `Option` and `Result`
monads in Typescript, inspired by languages like Rust and functional programming
paradigms. These abstractions help manage optional values and error handling in
a clean, type-safe way.

## Option Monad

The `Option` monad encapsulates an optional value. A value of type `Option<T>`
either contains a value (`some(value)`) or it is empty (`none`). This is useful
for functions that may not always return a value.

- `some(value)`: Indicates a present value.
- `none()`: Indicates the absence of a value.

### Use Cases

- Return a value if available, otherwise return nothing, without using `null` or
  `undefined`.
- Chain operations that may or may not produce a value.

## Result Monad

The `Result` monad represents the outcome of an operation that can succeed or
fail. A value of type `Result<T, E>` is either `ok(value)` (success) or
`err(error)` (failure).

- `ok(value)`: Represents a successful outcome.
- `err(error)`: Represents a failure, containing error information.

In the same way that you can `throw` many different types in Javascript, a
`Result<T, E>` can have any type as the possible `T` and `E` values. You can
instantiate `Error` objects, or you might prefer to pass strings instead for
more lightweight code.

### Use Cases

- Handling errors explicitly without exceptions, creating logic that is easier
  to reason about.
- Composing operations that may fail and propagating errors.

---

# Code Examples

## Option

```typescript
import { none, Option, some } from "optres";

// Creating an Option with a value
const value: Option<number> = some(42);

if (value.isSome()) {
  console.log("Got a value:", value.unwrap()); // prints 42
}

// Creating an Option with no value
const nothing: Option<number> = none();

if (nothing.isNone()) {
  console.log("No value present");
}

// Using Option in a function
function findEven(numbers: number[]): Option<number> {
  for (const n of numbers) {
    if (n % 2 === 0) return some(n);
  }
  return none();
}
```

## Result

```typescript
import { err, ok, Result } from "optres";

// Creating a successful Result
const success: Result<string, string> = ok("Everything went fine!");

if (success.isOk()) {
  console.log(success.unwrap()); // prints "Everything went fine!"
}

// Creating an error Result
const failure: Result<string, string> = err("Something went wrong");

if (failure.isErr()) {
  console.error(failure.unwrapErr()); // prints "Something went wrong"
}

// Using Result in a function
function parseNumber(input: string): Result<number, string> {
  const parsed = Number(input);
  if (isNaN(parsed)) {
    return err("Input is not a valid number");
  }
  return ok(parsed);
}
```

## Advanced use

Note that, while you _can_ use functions like `isSome`, `isOk` and `unwrap` as
in the examples above, it is more idiomatic to use functional patterns and the
principle of "tell, don't ask".

```typescript
function getAdmin(
  rawUsername: string,
): Result<User, "invalid username" | "not found" | "not admin"> {
  return validateUsername(rawUsername)
    .chain((username) =>
      getUserFromDatabase(username).okOr("not found" as const)
    )
    .chain((user) => user.isAdmin() ? ok(user) : err("not admin"));
}
const panel = getAdmin("sck").match({
  Ok: (admin) => getAdminPanel(admin),
  Err: (errorType) => getUserPanel(errorType),
});
```

---

# Summary

- Use `Option` for values that may or may not exist.
- Use `Result` for operations that may fail, and handle errors explicitly.
- The functions `some`, `none`, `ok`, and `err` are used to construct these
  monads.
