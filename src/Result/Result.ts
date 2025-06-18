import { type Ok, ok } from "./Ok.ts";
import { type Err, err } from "./Err.ts";

export type Result<T, E> = Ok<T, E> | Err<T, E>;
export { type Err, err, type Ok, ok };
