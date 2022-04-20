import { CallCounter } from "./lazy_test.ts";
import { asserts } from "../deps.ts";
import {
  fmap,
  linkedList,
  linkedListToArray,
  map,
  node,
  take,
} from "./linkedList.ts";

Deno.test("linkedListToArray to should convert list to array", () => {
  const list = linkedList(1, linkedList(2, linkedList(3)));
  asserts.assertEquals(linkedListToArray(list), [1, 2, 3]);
});

Deno.test("fmap changes the first node", () => {
  const list = linkedList(1, linkedList(2, linkedList(3)));
  const listWithHeadTimesTwo = fmap((n) => {
    return node(n.head * 2, n.tail);
  }, list);

  asserts.assertEquals(linkedListToArray(listWithHeadTimesTwo), [2, 2, 3]);
});

Deno.test("fmap calculates after using value", () => {
  const cc = new CallCounter();
  const list = linkedList(1, linkedList(2, linkedList(3)));
  const listWithHeadTimesTwo = fmap((n) => {
    return cc.call(() => node(n.head * 2, n.tail));
  }, list);
  asserts.assertEquals(cc.count, 0);

  const toArray = linkedListToArray(listWithHeadTimesTwo);
  asserts.assertEquals(cc.count, 1);

  asserts.assertEquals(toArray, [2, 2, 3]);
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

Deno.test("Take should only take first elements and return the rest", () => {
  const list = linkedList(
    1,
    linkedList(2, linkedList(3, linkedList(4))),
  );

  const firstTwo = take(list, 2);
  asserts.assertEquals(linkedListToArray(firstTwo), [1, 2]);
});
