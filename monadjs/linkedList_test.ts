import { CallCounter } from "./lazy_test.ts";
import { asserts } from "../deps.ts";
import { linkedList, linkedListToArray, map } from "./linkedList.ts";

Deno.test("linkedListToArray to should convert list to array", () => {
  const list = linkedList(1, linkedList(2, linkedList(3)));
  asserts.assertEquals(linkedListToArray(list), [1, 2, 3]);
});

Deno.test("Map should apply function on each value", () => {
  const double = (a: number) => a * 2;
  const list = linkedList(
    1,
    linkedList(2, linkedList(3)),
  );

  const listTimesTwo = map(list, double);

  asserts.assertEquals(
    linkedListToArray(listTimesTwo),
    [2, 4, 6],
  );
});

Deno.test("Map should only calculate functions after lifting", () => {
  const cc = new CallCounter();
  const list = linkedList(
    1,
    linkedList(2, linkedList(3)),
  );

  const listTimesTwo = map(list, (x) => cc.call(() => x * 2));
  asserts.assertEquals(cc.count, 0);

  const listArray = linkedListToArray(listTimesTwo);
  asserts.assertEquals(cc.count, 3);
  asserts.assertEquals(
    listArray,
    [2, 4, 6],
  );
});
