import { assertEquals } from "https://deno.land/std@0.135.0/testing/asserts.ts";
import { compose } from "./utils.ts";

Deno.test("Compose should be transparent", () => {
  const a = 2;
  const b = 4;
  // function to be composed
  const mult = (x: number, y: number) => x * y;

  // applying b should result in the same as mult(a,b)
  assertEquals(compose(mult, a)(b), mult(a, b));
});
