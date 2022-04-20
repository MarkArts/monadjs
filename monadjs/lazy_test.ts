import { asserts } from "../deps.ts";
import { applicative, bind, fmap, lazy, lazyf, lift } from "./lazy.ts";

export class CallCounter {
  count: number;

  constructor() {
    this.count = 0;
  }

  call<T>(fn: () => T): T {
    this.count++;
    return fn();
  }
}

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

Deno.test("Lazy doesn't run functions until lifted", () => {
  const cc = new CallCounter();

  const aString = lazy("2");
  const a = bind(aString, (x) => lazy(cc.call(() => parseInt(x))));
  asserts.assertEquals(cc.count, 0);
  const double = fmap((x) => cc.call(() => x * 2), a);
  asserts.assertEquals(cc.count, 0);

  const b = lazy(4);
  const add = applicative(
    fmap((x) => (y: number) => cc.call(() => x + y), b),
    double,
  );
  asserts.assertEquals(cc.count, 0);

  const result = lift(add);
  asserts.assertEquals(cc.count, 3);
  asserts.assertEquals(result, (2 * 2) + 4);
});
