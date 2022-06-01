import { CallCounter } from "./callCounter.ts";
import { asserts } from "../deps.ts";
import { infinite } from "./infinite.ts";
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
  asserts.equal(linkedListToArray(take(inf, 3)), [0, 2, 4]);
});

Deno.test("infinite should start from the given start", () => {
  const inf = infinite(5, 4);
  asserts.equal(linkedListToArray(take(inf, 3)), [5, 9, 13]);
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
