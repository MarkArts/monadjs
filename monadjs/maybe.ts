export const nothing = "nothing";
export const just = "just";
export type Just<T> = { type: "just"; val: T };
export type Nothing = { type: "nothing" };

export type Maybe<T> = Just<T> | Nothing;

export function unit<T>(x: T | undefined): Maybe<T> {
  if (x === undefined) {
    return { type: nothing };
  }
  return { type: just, val: x };
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

  return unit(f(x.val));
}

// see: https://en.wikipedia.org/wiki/Applicative_functor
export function fmap2<T, U>(f: (x: T) => U, x: Maybe<T>): Maybe<U> {
  return applicative(unit(f), x);
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

  return unit(f.val(x.val));
}
