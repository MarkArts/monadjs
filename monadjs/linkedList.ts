import * as lazy from "./lazy.ts";
import * as maybe from "./maybe.ts";

// LinkedList<T> is a linked list with a lazy tail
// this means each element is a value with a "rest" value that is lazy
// if the LinkedList is Maybe.Nothing it means the end of the list
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
      tail: emptyLinkedList(),
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

// Not sure if fmap is the correct name here
// as the type signature isn't exactly that of fmap, (fn:T (x: T) => U, LinkedList<T>): LinkedList<U>
// that signature would match if the funtion would be applied on the head of the node
// but we want to apply a function on the whole node (containing the tail)
// to implement map and fold
// ps: typescript typing is smart enough to recognize that if you change the type of the head
// the tail returned should also be of that type
export function fmap<T, U>(
  fn: (x: Node<T>) => Node<U>,
  xs: LinkedList<T>,
): LinkedList<U> {
  return lazy.fmap((lazyVal) => {
    return maybe.fmap((maybeVal) => {
      return fn(maybeVal);
    }, lazyVal);
  }, xs);
}

export function map<T, U>(xs: LinkedList<T>, fn: (v: T) => U): LinkedList<U> {
  return fmap((n) => {
    return node(fn(n.head), map(n.tail, fn));
  }, xs);
}

// take should also return the tail of the linked list
// not sure yet how i would accomplish that with fmap
// or another construct
export function take<T>(
  xs: LinkedList<T>,
  i: number,
): LinkedList<T> {
  if (i <= 0) {
    return emptyLinkedList();
  }

  return fmap((n) => {
    return node(n.head, take(n.tail, i - 1));
  }, xs);
}

export function linkedListToArray<T>(xs: LinkedList<T>): T[] {
  const list = lazy.lift(xs);
  if (list.type === maybe.Nothing) {
    return [];
  }
  return [list.val.head, ...linkedListToArray(list.val.tail)];
}

export function arrayToLinkedList<T>(xs: T[]): LinkedList<T> {
  if (!xs || xs.length <= 0) {
    return emptyLinkedList();
  }
  return xs.reverse().reduce((acc, x) => {
    return linkedList(x, acc);
  }, emptyLinkedList<T>());
}

export function lFold<T, U>(
  fn: (acc: U, v: T) => U,
  init: U,
  xs: LinkedList<T>,
): lazy.Lazy<U> {
  return lazy.fmap((node) => {
    if (node.type === maybe.Nothing) {
      return init;
    }
    const f = lFold(fn, fn(init, node.val.head), node.val.tail);
    const l = lazy.lift(f);
    return l;
  }, xs);
}

export function concat<T>(
  xs: LinkedList<T>,
  ys: LinkedList<T>,
): LinkedList<T> {
  return lazy.fmap((lazyVal) => {
    if (lazyVal.type === maybe.Nothing) {
      return lazy.lift(ys);
    }
    return maybe.maybe(node(lazyVal.val.head, concat(lazyVal.val.tail, ys)));
  }, xs);
}

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
