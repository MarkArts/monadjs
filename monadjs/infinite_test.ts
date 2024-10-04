import { CallCounter } from "./callCounter.ts";
import { asserts } from "../deps.ts";
import { fibonaci, infinite } from "./infinite.ts";
import { lift } from "./lazy.ts";
import {
  arrayToLinkedList,
  concat,
  lFold,
  linkedList,
  linkedListToArray,
  map,
  take,
} from "./linkedList.ts";

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
  asserts.assertEquals(
    linkedListToArray(take(fib, 8)),
    [0, 1, 1, 2, 3, 5, 8, 13],
  );
});

Deno.test(
  "should be able to sum the first 8 numbers of fibonaci times 2",
  () => {
    const cc = new CallCounter();
    const fib = fibonaci();
    const fib2 = map(fib, (x) => cc.call(() => x * 2));
    asserts.assertEquals(cc.count, 0);
    const sum = lFold((acc, c) => cc.call(() => acc + c), 0, take(fib2, 7));
    asserts.assertEquals(cc.count, 0);
    asserts.assertEquals(lift(sum), 40); // sum: [0*2, 1*2, 1*2, 2*2, 3*2, 5*2, 8*2] = [0,2,2,4,6,10,16]
    asserts.assertEquals(cc.count, 7 + 7); // TODO: this currently triggers to many calculations
  },
);

Deno.test("Test example in Readme", () => {
  const cc = new CallCounter(); // this will keep track of actual excecution
  // create a list of 3 numbers
  const list = linkedList(1, linkedList(2, linkedList(3)));
  // multiply each item in the list times 2
  const multiplied = map(list, (x) => cc.call(() => x * 2));

  // at this point multiplied is still a promise to multiple each value
  // to demonstrate this we create a infinite list starting at 1 incremented with 1
  const inf = infinite(0, 1);
  // we do the same multiplication
  const infMultiplied = map(inf, (x) => cc.call(() => x * 2));

  // now we combine both list together by appending the infinite list to the right of the firs
  // note that the other way is possible but will never reach the end of the left infinite list :p
  const combined = concat(multiplied, infMultiplied);

  // to demonstrate the combined list we sum the first 5 entries, of which 2 are in the infinite list,
  // with take and fold
  const sumOfFirst5 = lFold(
    (acc, x) => cc.call(() => acc + x),
    0,
    take(combined, 5),
  );

  // at this point sumOfFirst5 will be of type Lazy<number>
  // and none of the multiplication will have actually been excecute
  // only after we lift the value of sumOfFirst5 the concatation and multuplication will be done
  asserts.assertEquals(cc.count, 0); // verify no multiplications where made
  const result = lift(sumOfFirst5);
  asserts.assertEquals(cc.count, 10); // 3 multiplications in the first list, 2 in the second and 5 sums
  asserts.assertEquals(result, 14); // sum of [1*2,2*2,3*2, 0*2,1*2] = 14

  // The same codes without comments and the call counter adding syntax complexity
  const _l = map(arrayToLinkedList([1, 2, 3]), (x) => x * 2);
  const _inf = map(infinite(0, 1), (x) => cc.call(() => x * 2));
  const _sum = lFold((acc, x) => acc + x, 0, take(concat(_l, _inf), 5));
  asserts.assertEquals(lift(_sum), 14);
});
