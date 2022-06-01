import { CallCounter } from "./lazy_test.ts";
import { lift } from "./lazy.ts";
import { asserts } from "../deps.ts";
import {
  arrayToLinkedList,
  concat,
  flatMap,
  fmap,
  lFold,
  linkedList,
  linkedListToArray,
  map,
  node,
  take,
} from "./linkedList.ts";

Deno.test("linkedListToArray should convert list to array", () => {
  const list = linkedList(1, linkedList(2, linkedList(3)));
  asserts.assertEquals(linkedListToArray(list), [1, 2, 3]);
});
Deno.test("larrayToLinkedList should convert  array to list", () => {
  const arr = [1, 2, 3];
  asserts.assertEquals(
    arrayToLinkedList(arr),
    linkedList(1, linkedList(2, linkedList(3))),
  );
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

Deno.test("Fold should sum all items in a list with delayed excecution", () => {
  const cc = new CallCounter();
  const list = linkedList(
    1,
    linkedList(2, linkedList(3, linkedList(4))),
  );

  const sum = lFold((acc, x) => cc.call(() => acc + x), 0, list);
  asserts.assertEquals(cc.count, 0);
  asserts.assertEquals(lift(sum), 10);
  asserts.assertEquals(cc.count, 4); // 0+1, 1+2, 3+3, 6+4
});

Deno.test("Concat should add two list together with delayed excecution", () => {
  const cc = new CallCounter();
  const list = map(
    linkedList(
      1,
      linkedList(2, linkedList(3)),
    ),
    (x) => cc.call(() => x + 1),
  );

  const list2 = map(
    linkedList(
      4,
      linkedList(5),
    ),
    (x) => cc.call(() => x + 1),
  );

  asserts.assertEquals(cc.count, 0);
  const sum = concat(list, list2);
  asserts.assertEquals(cc.count, 0);
  asserts.assertEquals(linkedListToArray(sum), [
    1 + 1,
    2 + 1,
    3 + 1,
    4 + 1,
    5 + 1,
  ]);
  asserts.assertEquals(cc.count, 5); // 1+1, 1+2, 3+1, 4+1, 5+1
});

Deno.test("Concat should only excecute the first values of take", () => {
  const cc = new CallCounter();
  const list = map(
    linkedList(
      1,
      linkedList(2, linkedList(3)),
    ),
    (x) => cc.call(() => x + 1),
  );

  const list2 = map(
    linkedList(
      4,
      linkedList(5),
    ),
    (x) => cc.call(() => x + 1),
  );

  asserts.assertEquals(cc.count, 0);
  const sum = concat(list, list2);
  asserts.assertEquals(cc.count, 0);
  asserts.assertEquals(linkedListToArray(take(sum, 2)), [
    1 + 1,
    2 + 1,
  ]);
  asserts.assertEquals(cc.count, 2); // 1+1, 1+2
});

Deno.test("flatmap should flatten array with delayed excecution", () => {
  const cc = new CallCounter();
  const list = map(
    linkedList(
      1,
      linkedList(2, linkedList(3)),
    ),
    (x) => cc.call(() => x + 1),
  );
  asserts.assertEquals(cc.count, 0);

  // [1,2,3] -> [0,1 0,1,2 0,1,2,3]
  const flat = flatMap(list, (x) => arrayToLinkedList([...Array(x).keys()]));
  asserts.assertEquals(cc.count, 0);

  asserts.assertEquals(linkedListToArray(take(flat, 5)), [
    0,
    1,
    0,
    1,
    2,
  ]);
  asserts.assertEquals(cc.count, 2); // 1+1, 1+2
});
