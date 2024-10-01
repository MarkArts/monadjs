import { CallCounter } from "./callCounter.ts";
import { asserts } from "../deps.ts";
import { applicative, bind, fmap, Lazy, lift, unit } from "./lazy.ts";

Deno.test("unit can handle functions and values", () => {
  const value = unit(2);
  const f = unit(() => 3);

  asserts.assertEquals(value.type, "func");
  asserts.assertEquals(typeof value.v, "function");
  asserts.assertEquals((value.v as () => Lazy<number>)().type, "val");
  asserts.assertEquals((value.v as () => Lazy<number>)().v, 2);

  asserts.assertEquals(f.type, "func");
  asserts.assertEquals(typeof f.v, "function");
  asserts.assertEquals((f.v as () => Lazy<() => number>)().type, "val");
  asserts.assertEquals((f.v as () => Lazy<() => number>)().v(), 3);
});

Deno.test("lift can lift value and function", () => {
  const value = unit(2);
  const f = unit(() => 3);

  asserts.assertEquals(lift(value), 2);
  asserts.assertEquals(lift(f)(), 3);
});

Deno.test("Calling a function on a call counter increases it's count", () => {
  const cc = new CallCounter();
  asserts.assertEquals(cc.count, 0);
  cc.call(() => {});
  asserts.assertEquals(cc.count, 1);
});

Deno.test("Can multiple lazy val with functor", () => {
  const x = unit(2);
  const multiplied = fmap((y) => y * 2, x);
  asserts.assertEquals(multiplied.type, "func");
  asserts.assertEquals(lift(multiplied), 4);
});

Deno.test("Can transform lazy with bind", () => {
  const v = 2;
  const x = unit(v);
  const xString = bind(x, (_x) => unit(_x.toString()));
  const xStringLifted = lift(xString);
  asserts.assertEquals(xStringLifted, v.toString());
  asserts.assertEquals(typeof xStringLifted, "string");
});

Deno.test("Can multiple lazy func with functor", () => {
  const x = unit(2);
  const multiplied = fmap((y) => y * 2, x);
  asserts.assertEquals(multiplied.type, "func");
  asserts.assertEquals(lift(multiplied), 4);
});

Deno.test("Can chain multiple lazy func with functor", () => {
  const x = unit(2);
  const multiplied = fmap((y) => y * 2, x);
  const multipliedAgain = fmap((y) => y * 2, multiplied);
  asserts.assertEquals(multipliedAgain.type, "func");
  asserts.assertEquals(lift(multipliedAgain), 8);
});

Deno.test("Can multiple 2 lazy values with applicative and functor", () => {
  const a = unit(2);
  const b = unit(4);
  const mult = applicative(fmap((x) => (y: number) => x * y, a), b);
  console.log(mult);
  asserts.assertEquals(lift(mult), 2 * 4);
});

Deno.test("bind does not increase call counter", () => {
  const cc = new CallCounter();

  const aString = unit("2");
  const a = bind(aString, (x) => unit(cc.call(() => parseInt(x))));
  asserts.assertEquals(cc.count, 0);
  const lifted = lift(a);
  asserts.assertEquals(lifted, 2);
  asserts.assertEquals(cc.count, 1);
});

Deno.test("applicative does not increase call counter", () => {
  const cc = new CallCounter();

  const x = unit(2);
  const y = unit(3);
  const mult = applicative(
    fmap((x) => (y: number) => cc.call(() => x * y), x),
    y,
  );
  asserts.assertEquals(cc.count, 0);

  const lifted = lift(mult);
  asserts.assertEquals(lifted, 6);
  asserts.assertEquals(cc.count, 1);
});

Deno.test("Lazy doesn't run functions until lifted", () => {
  const cc = new CallCounter();

  const aString = unit("2");
  const a = bind(aString, (x) => unit(cc.call(() => parseInt(x))));
  asserts.assertEquals(cc.count, 0);

  const double = fmap((x) => cc.call(() => x * 2), a);
  asserts.assertEquals(cc.count, 0);

  const b = unit(4);
  const add = applicative(
    fmap((x) => (y: number) => cc.call(() => x + y), b),
    double,
  );
  asserts.assertEquals(cc.count, 0);

  const result = lift(add);
  asserts.assertEquals(cc.count, 3);
  asserts.assertEquals(result, (2 * 2) + 4);
});
