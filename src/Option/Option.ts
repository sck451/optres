import { None, none } from "./None.ts";
import { Some, some } from "./Some.ts";

/**
 * `Option` is a type that represents either the presence ({@link Some}) or
 * absence ({@link None}) of a value.
 */
export type Option<T> = Some<T> | None<T>;
export { None, none, Some, some };
