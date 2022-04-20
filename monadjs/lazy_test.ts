// url_test.ts
import { asserts } from "../deps.ts";
import { applicative, bind, fmap, lazy, lazyf, lift } from "./lazy.ts";

Deno.test("Can multiple lazy val with functor", () => {
  const x = lazy(2);
  const multiplied = fmap((y) => y * 2, x);
  asserts.assertEquals(multiplied.type, "func");
  asserts.assertEquals(lift(multiplied), 4);
});

Deno.test("Can transform lazy with bind", () => {
  const v = 2;
  const x = lazy(v);
  const xString = bind(x, (_x) => lazy(_x.toString()));
  const xStringLifted = lift(xString);
  asserts.assertEquals(xStringLifted, v.toString());
  asserts.assertEquals(typeof xStringLifted, "string");
});

Deno.test("Can multiple lazy func with functor", () => {
  const x = lazyf(() => lazy(2));
  const multiplied = fmap((y) => y * 2, x);
  asserts.assertEquals(multiplied.type, "func");
  asserts.assertEquals(lift(multiplied), 4);
});

Deno.test("Can multiple 2 lazy values with applicative and functor", () => {
  const a = lazy(2);
  const b = lazy(4);
  const mult = applicative(fmap((x) => (y: number) => x * y, a), b);
  asserts.assertEquals(lift(mult), 2 * 4);
});

Deno.test("Lazy doesn't call functions until lifted", () => {
  let count = 0;
  // call will increase count everytime it applies the given function
  // with this we can keep track of excecution of the transofmrations
  const call = <T>(f: () => T) => {
    count++;
    return f();
  };

  const a = lazy(2);
  const b = lazy(4);
  const double = fmap((x) => call(() => x * 2), a);
  asserts.assertEquals(count, 0);
  const add = applicative(
    fmap((x) => (y: number) => call(() => x + y), double),
    b,
  );
  asserts.assertEquals(count, 0);

  const result = lift(add);
  asserts.assertEquals(count, 2);
  asserts.assertEquals(result, (2 * 2) + 4);
});
