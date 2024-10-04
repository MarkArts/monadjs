import * as linkedList from "./linkedList.ts";
import * as lazy from "./lazy.ts";
import * as maybe from "./maybe.ts";

export function infinite(start = 0, inc = 1): linkedList.LinkedList<number> {
  return lazy.executeLazy(() =>
    maybe.unit(linkedList.node(start, infinite(start + inc, inc)))
  );
}

export function fibonaci(a = 0, b = 1): linkedList.LinkedList<number> {
  return lazy.executeLazy(() =>
    maybe.unit(linkedList.node(a, fibonaci(b, a + b)))
  );
}

function* normalInfinite(start = 0, end = Infinity, step = 1) {
  let iterationCount = 0;
  for (let i = start; i < end; i += step) {
    iterationCount++;
    yield i;
  }
  return iterationCount;
}
