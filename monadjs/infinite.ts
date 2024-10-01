import * as linkedList from "./linkedList.ts";
import * as lazy from "./lazy.ts";
import * as maybe from "./maybe.ts";

// we can't define this as:
// linkedList.linkedList(start, infinite(start + inc, inc))
// because javascript wil excecute infinite before passing it as a argument

export function infinite(start = 0, inc = 1): linkedList.LinkedList<number> {
  return lazy.executeLazy(() =>
    maybe.unit(linkedList.node(
      start,
      infinite(start + inc, inc),
    ))
  );
}

export function fibonaci(a = 0, b = 1): linkedList.LinkedList<number> {
  return lazy.executeLazy(() =>
    maybe.unit(linkedList.node(
      a,
      fibonaci(b, a + b),
    ))
  );
}
