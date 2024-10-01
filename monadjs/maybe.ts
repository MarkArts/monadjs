export const nothing = "nothing";
export const something = "something";
export type Something<T> = { type: "something"; val: T };
export type Nothing = { type: "nothing" };

export type Maybe<T> = Something<T> | Nothing;

export function maybe<T>(x: T | undefined): Maybe<T> {
  if (x === undefined) {
    return { type: nothing };
  }
  return { type: something, val: x };
}

export function bind<T, U>(x: Maybe<T>, f: (x: T) => Maybe<U>): Maybe<U> {
  if (x.type === nothing) {
    return x;
  }

  return f(x.val);
}

export function fmap<T, U>(f: (x: T) => U, x: Maybe<T>): Maybe<U> {
  if (x.type === nothing) {
    return x;
  }

  return maybe(f(x.val));
}

export function applicative<T, U>(
  f: Maybe<(x: T) => U>,
  x: Maybe<T>,
): Maybe<U> {
  if (f.type === nothing) {
    return f;
  }

  if (x.type === nothing) {
    return x;
  }

  return maybe(f.val(x.val));
}
