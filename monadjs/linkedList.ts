import * as lazy from "./lazy.ts";
import * as maybe from "./maybe.ts";

// LinkedList<T> is a linked list with a lazy tail
// this means each element is a value with a "rest" value that is lazy
// if the LinkedList is nothing it means the end of the list
export type LinkedList<T> = lazy.Lazy<
  maybe.Maybe<Node<T>>
>;
export type Node<T> = {
  head: T;
  tail: LinkedList<T>;
};

export function linkedList<T>(x: T, xs?: LinkedList<T>): LinkedList<T> {
  if (xs) {
    return lazy.lazy(maybe.maybe({
      head: x,
      tail: xs,
    }));
  } else {
    return lazy.lazy(maybe.maybe({
      head: x,
      tail: lazy.lazy({ type: maybe.Nothing }),
    }));
  }
}

export function emptyLinkedList<T>(): LinkedList<T> {
  return lazy.lazy({ type: maybe.Nothing });
}

export function node<T>(x: T, xs: LinkedList<T>): Node<T> {
  return {
    head: x,
    tail: xs,
  };
}

export function map<T, U>(xs: LinkedList<T>, fn: (v: T) => U): LinkedList<U> {
  return lazy.fmap((listVal) => {
    return maybe.fmap((maybeVal) => {
      return node(fn(maybeVal.head), map(maybeVal.tail, fn));
    }, listVal);
  }, xs);
}

// export function take<T>(
//   xs: LinkedList<T>,
//   i: number,
// ): [LinkedList<T>, LinkedList<T>] {
//   function rec(
//     culm: LinkedList<T>,
//     xs: LinkedList<T>,
//     i: number,
//   ): [LinkedList<T>, LinkedList<T>] {
//     if (i <= 0) {
//       return [culm, xs];
//     }

//     const list = lazy.lift(xs);
//     if (list.type === "nothing") {
//       return [culm, xs];
//     }

//     return rec(linkedList(list.val.head, culm), list.val.tail, i - 1);
//   }

//   return rec(emptyLinkedList, xs, i);
// }

export function linkedListToArray<T>(xs: LinkedList<T>): T[] {
  const list = lazy.lift(xs);
  if (list.type === maybe.Nothing) {
    return [];
  }
  return [list.val.head, ...linkedListToArray(list.val.tail)];
}

// export function arrayToLinkedList<T>(xs: T[]): LinkedList<T> {
//   if (!xs || xs.length <= 0) {
//     return linkedList(undefined);
//   }
//   return xs.reverse().reduce((acc, x) => {
//     return linkedList(x, acc);
//   }, linkedList(undefined));
// }

export function lFold<T, U>(
  fn: (acc: U, v: T) => U,
  init: U,
  xs: LinkedList<T>,
): U {
  const list = lazy.lift(xs);
  if (list.type === "nothing") {
    return init;
  }
  return lFold(fn, fn(init, list.val.head), list.val.tail);
}

// export function concat<T>(xs: LinkedList<T>, ys:LinkedList<T>): LinkedList<T>{
//   return lFold( (acc, x) => {
//     if (lift(acc.tail).type === Nothing) {
//       return linkedList(x, ys)
//     }
//     return linkedList(x, acc)
//   }, linkedList(undefined), xs)
// }

// //partially applied which can use the `applyf` lambda for composing the next infinite list
// // but typescript can't infere type for: lmap((x) => x*3)(infinite) because `infinite` decides the type of `x`
// const clmap = <T, U>(fn: (v:T) => U) => (xs: LinkedList<T>): LinkedList<U> => {
//   if(xs.tail == undefined) {
//     return linkedList(fn(xs.head))
//   } else {
//     return linkedList(fn(xs.head), clmap(fn) (xs.tail))
//   }
// }

// export function lFlatMap<T, U>(xs: LinkedList<T>, fn: (v:T) => U[]): LinkedList<U> {
//   if(xs.tail == undefined) {
//     return arrayToLinkedList(fn(xs.head))
//   } else {
//     return concat(arrayToLinkedList(fn(xs.head)),sn lFlatMap(xs.tail, fn))
//   }
// }

// const list = linkedList(
//   lazy(1),
//   linkedList(
//     lazy(2),
//     linkedList(lazy(3), linkedList(lazy(4), emptyLinkedList)),
//   ),
// );
// console.log(list);
// const timesTwo = map(list, (x) =>
//   applyLazy(x, (y) => {
//     console.log("tick*2");
//     return y * 2;
//   }));
// console.log(timesTwo);
// const timesTwoAndFour = map(timesTwo, (x) =>
//   applyLazy(x, (y) => {
//     console.log("tick*4");
//     return y * 4;
//   }));
// console.log(timesTwoAndFour);

// console.log("take 2");
// const [first3, rest] = take(timesTwoAndFour, 2);
// console.log(first3, rest);
// console.log("Convert first2 to normal array");
// const arr = linkedListToArray(first3);
// console.log(arr);
// // console.log("lift all elemnts in array")
// // console.log(arr.map(lift))

// const sum = lFold((acc, x) => sh(acc, x, (_a, _b) => _a + _b), lazy(0), first3);
// console.log(sum);
// console.log(lift(sum));
