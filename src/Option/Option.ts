import { None, none } from "./None.ts";
import { Some, some } from "./Some.ts";

export type Option<T> = Some<T> | None<T>;
export { None, none, Some, some };
