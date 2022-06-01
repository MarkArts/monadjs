import * as linkedList from "./linkedList.ts";
import * as lazy from "./lazy.ts";
import * as maybe from "./maybe.ts";

export function infinite(start = 0, inc = 1): linkedList.LinkedList<number> {
  return lazy.pure(() =>
    maybe.maybe(linkedList.node(
      start,
      infinite(start + inc, inc),
    ))
  );
}

export function fibonaci(a = 0, b = 1): linkedList.LinkedList<number> {
  return lazy.pure(() =>
    maybe.maybe(linkedList.node(
      a,
      fibonaci(b, a + b),
    ))
  );
}
