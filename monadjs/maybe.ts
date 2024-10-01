export const nothingType = "nothing";
export const justType = "just";
export const nothing = { type: nothingType } as Nothing;
export type Just<T> = { type: "just"; val: T };
export type Nothing = { type: "nothing" };

export type Maybe<T> = Just<T> | Nothing;

export function unit<T>(x: T): Maybe<T> {
  return { type: justType, val: x };
}

export function bind<T, U>(x: Maybe<T>, f: (_: T) => Maybe<U>): Maybe<U> {
  if (x.type === nothingType) {
    return x;
  }

  return f(x.val);
}

// fmap is a functor that will apply a function to a value inside a Maybe
// and in turn return that value as a maybe
export function fmap<T, U>(f: (_: T) => U, x: Maybe<T>): Maybe<U> {
  return bind(x, (val) => unit(f(val)));
}

// see: https://en.wikipedia.org/wiki/Applicative_functor
export function fmapWithApplicative<T, U>(
  f: (_: T) => U,
  x: Maybe<T>,
): Maybe<U> {
  return applicative(unit(f), x);
}

// applicative is a function that apply the potential
// value of x to the potential function of f
export function applicative<T, U>(
  f: Maybe<(_: T) => U>,
  x: Maybe<T>,
): Maybe<U> {
  return bind(f, (fn) => bind(x, (val) => unit(fn(val))));
}

// lift will unwrap a value from a maybe
// returning either undefined or the value
export function lift<T>(x: Maybe<T>): T | undefined {
  if (x.type === justType) {
    return x.val;
  }
  return undefined;
}
