import { asserts } from "../deps.ts";
import { compose, mult, partial } from "./utils.ts";

import { applicative, fmap, lift, unit } from "./maybe.ts";

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

  const myfunction = (x: number, y: number) => {
    return x * 2 * 5 / 20 + y / 5;
  };

  const a = 2;
  const b = 4;

  const result = app(f(partial(myfunction))(unit(a)))(unit(b));

  asserts.assertEquals(lift(result), myfunction(a, b));
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

Deno.test("compose should correctly chain a bunch of functions together", () => {
  const add1times2minus3 = compose(
    [
      (x: number) => x + 1,
      (x: number) => x * 2,
      (x: number) => x - 3,
    ],
  );

  asserts.equal(add1times2minus3(10), 17);
});
