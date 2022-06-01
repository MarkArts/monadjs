import { CallCounter } from "./callCounter.ts";
import { asserts } from "../deps.ts";
import { fibonaci, infinite } from "./infinite.ts";
import { lift } from "./lazy.ts";
import { concat, lFold, linkedListToArray, map, take } from "./linkedList.ts";

Deno.test("mapping over infinite should not trigger calculation", () => {
  const cc = new CallCounter();
  const inf = infinite();

  map(inf, (x) => cc.call(() => x * 2));
  asserts.assertEquals(cc.count, 0);
});

Deno.test("Concating two infinite list should not throw errors", () => {
  const inf = infinite();
  const inf2 = infinite();

  concat(inf, inf2);
});

Deno.test("infinite should increment with the given increment", () => {
  const inf = infinite(0, 2);
  asserts.assertEquals(linkedListToArray(take(inf, 3)), [0, 2, 4]);
});

Deno.test("infinite should start from the given start", () => {
  const inf = infinite(5, 4);
  asserts.assertEquals(linkedListToArray(take(inf, 3)), [5, 9, 13]);
});

Deno.test("Should be able to fold part of the infinite list", () => {
  const cc = new CallCounter();
  const inf = infinite(1, 1);
  const infTimesTwo = map(inf, (x) => cc.call(() => x * 2));

  const sum = lFold(
    (acc, n) => cc.call(() => acc + n),
    0,
    take(infTimesTwo, 3),
  );

  asserts.assertEquals(cc.count, 0);
  asserts.assertEquals(lift(sum), 12); // sum of [1,2,3] * 2 =  [2,4,6]
  asserts.assertEquals(cc.count, 6); // 1*2, 2*2, 3*2  + 0+2, 2 + 4, 6+6
});

Deno.test("fibonaci should return the correct sequence", () => {
  const fib = fibonaci();
  asserts.assertEquals(linkedListToArray(take(fib, 8)), [
    0,
    1,
    1,
    2,
    3,
    5,
    8,
    13,
  ]);
});

Deno.test("should be able to sum the first 8 numbers of fibonaci times 2", () => {
  const cc = new CallCounter();
  const fib = fibonaci();
  const fib2 = map(fib, (x) => cc.call(() => x * 2));
  asserts.assertEquals(cc.count, 0);
  const sum = lFold((acc, c) => cc.call(() => acc + c), 0, take(fib2, 7));
  asserts.assertEquals(cc.count, 0);
  asserts.assertEquals(lift(sum), 40); // sum: [0*2, 1*2, 1*2, 2*2, 3*2, 5*2, 8*2] = [0,2,2,4,6,10,16]
  asserts.assertEquals(cc.count, 7 + 7); // TODO: this currently triggers to many calculations
});
