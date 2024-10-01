import { asserts } from "../deps.ts";
import { compose, mult } from "./utils.ts";

import { applicative, fmap, lift, unit } from "./lazy.ts";

Deno.test("Compose should be transparent", () => {
  const a = 2;
  const b = 4;
  // function to be composed
  const mult = (x: number, y: number) => x * y;

  // applying b should result in the same as mult(a,b)
  asserts.assertEquals(compose(mult)(a)(b), mult(a, b));
});

Deno.test("compose should be able to simplify applicative", () => {
  const app = compose(applicative);
  const f = compose(fmap);
  const m = compose(mult);

  const a = unit(2);
  const b = unit(4);

  const multiplied = app(f(m)(a))(b);

  asserts.assertEquals(lift(multiplied), 2 * 4);
});
