import * as lazy from "./lazy.ts";
import * as maybe from "./maybe.ts";

// LinkedList<T> is a linked list with a lazy tail
// this means each element is a value with a "rest" value that is lazy
// if the LinkedList is maybe.nothing it means the end of the list
export type LinkedList<T> = lazy.Lazy<maybe.Maybe<Node<T>>>;
export type Node<T> = {
  head: T;
  tail: LinkedList<T>;
};

export function linkedList<T>(x: T, xs?: LinkedList<T>): LinkedList<T> {
  if (xs) {
    return lazy.unit(
      maybe.unit({
        head: x,
        tail: xs,
      }),
    );
  } else {
    return lazy.unit(
      maybe.unit({
        head: x,
        tail: emptyLinkedList(),
      }),
    );
  }
}

export function emptyLinkedList<T>(): LinkedList<T> {
  return lazy.unit(maybe.nothing);
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
export function take<T>(xs: LinkedList<T>, i: number): LinkedList<T> {
  if (i <= 0) {
    return emptyLinkedList();
  }

  return fmap((n) => {
    return node(n.head, take(n.tail, i - 1));
  }, xs);
}

export function linkedListToArray<T>(xs: LinkedList<T>): T[] {
  const list = lazy.lift(xs);
  if (list.type == maybe.nothingType) {
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
  return lazy.bind(xs, (node) => {
    if (node.type === maybe.nothingType) {
      return lazy.unit(init);
    }
    return lFold(fn, fn(init, node.val.head), node.val.tail);
  });
}

export function concat<T>(xs: LinkedList<T>, ys: LinkedList<T>): LinkedList<T> {
  return lazy.bind(xs, (lazyVal) => {
    if (lazyVal.type === maybe.nothingType) {
      return ys;
    }
    return linkedList(lazyVal.val.head, concat(lazyVal.val.tail, ys));
  });
}

export function flatten<T>(xss: LinkedList<LinkedList<T>>): LinkedList<T> {
  function rec(
    current: LinkedList<LinkedList<T>>,
    acc: LinkedList<T>,
  ): LinkedList<T> {
    return lazy.bind(current, (x) => {
      if (x.type === maybe.nothingType) {
        return acc;
      }
      return concat(x.val.head, rec(x.val.tail, acc));
    });
  }
  return rec(xss, emptyLinkedList<T>());
}

export function flatMap<T, U>(
  xs: LinkedList<T>,
  fn: (v: T) => LinkedList<U>,
): LinkedList<U> {
  return flatten(map(xs, fn));
}

export function head<T>(xs: LinkedList<T>): maybe.Maybe<T> {
  const list = lazy.lift(xs);
  if (list.type == maybe.nothingType) {
    return maybe.nothing;
  }
  return maybe.unit(list.val.head);
}

export function tail<T>(xs: LinkedList<T>): maybe.Maybe<LinkedList<T>> {
  const list = lazy.lift(xs);
  if (list.type == maybe.nothingType) {
    return maybe.nothing;
  }
  return maybe.unit(list.val.tail);
}
