import { Ok, ok } from "./Ok.ts";
import { Err, err } from "./Err.ts";

export type Result<T, E> = Ok<T, E> | Err<T, E>;
export { Err, err, Ok, ok };
