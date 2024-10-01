import { asserts } from "../deps.ts";
import { mult, partial } from "./utils.ts";

import { applicative, fmap, lift, unit } from "./lazy.ts";

Deno.test("partial should be transparent", () => {
  const a = 2;
  const b = 4;
  // function to be composed
  const mult = (x: number, y: number) => x * y;

  // applying b should result in the same as mult(a,b)
  asserts.assertEquals(partial(mult)(a)(b), mult(a, b));
});

Deno.test("compose should be able to simplify applicative", () => {
  const app = partial(applicative);
  const f = partial(fmap);
  const m = partial(mult);

  const a = unit(2);
  const b = unit(4);

  const multiplied = app(f(m)(a))(b);

  asserts.assertEquals(lift(multiplied), 2 * 4);
});

Deno.test("showcase what partial applying functions is with compose", () => {
  const a = 2;
  const b = 3;

  const multiply = (x: number, y: number) => x * y;

  const cool = (x: number) => (y: number) => x * y;
  const cooler = partial(multiply);

  asserts.equal(multiply(a, b), 6);
  asserts.equal(cool(a)(b), 6);
  asserts.equal(cooler(a)(b), 6);
});
