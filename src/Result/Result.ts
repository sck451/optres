import { Ok, ok } from "./Ok.ts";
import { Err, err } from "./Err.ts";

/**
 * `Result` is a type that represents either the success ({@link Ok}) or
 * failure ({@link Err}) of an operation.
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;
export { Err, err, Ok, ok };
