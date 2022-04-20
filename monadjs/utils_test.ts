import { asserts } from "../deps.ts";
import { compose } from "./utils.ts";

Deno.test("Compose should be transparent", () => {
  const a = 2;
  const b = 4;
  // function to be composed
  const mult = (x: number, y: number) => x * y;

  // applying b should result in the same as mult(a,b)
  asserts.assertEquals(compose(mult, a)(b), mult(a, b));
});
