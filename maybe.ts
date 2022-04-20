export const Nothing = "nothing";
export const Val = "val";
export type Maybe<T> = { type: "val"; val: T } | { type: "nothing" };

export function maybe<T>(x: T | undefined): Maybe<T> {
  if (x === undefined) {
    return { type: Nothing };
  }
  return { type: Val, val: x };
}

export function bind<T, U>(x: Maybe<T>, f: (x: T) => Maybe<U>): Maybe<U> {
  if (x.type === Nothing) {
    return x;
  }

  return f(x.val);
}

export function fmap<T, U>(f: (x: T) => U, x: Maybe<T>): Maybe<U> {
  if (x.type === Nothing) {
    return x;
  }

  return maybe(f(x.val));
}

export function applicative<T, U>(
  f: Maybe<(x: T) => U>,
  x: Maybe<T>,
): Maybe<U> {
  if (f.type === Nothing) {
    return f;
  }

  if (x.type === Nothing) {
    return x;
  }

  return maybe(f.val(x.val));
}
