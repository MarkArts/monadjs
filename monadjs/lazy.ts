// Lazy<T> is a type that is either
//   1) a value
//   2) a function that returns a lazy value
// Having this circular type means we can chain promises of promises which
// i promise wil not be the worst idea in this script
// see: https://en.wikipedia.org/wiki/Lazy_evaluation
export type Lazy<T> = { type: "val"; v: T } | {
  type: "func";
  v: () => Lazy<T>;
};

// constructor for the value type (so an actual value)
export function unit<T>(x: T): Lazy<T> {
  return {
    type: "func",
    v: () => {
      return { type: "val", v: x };
    },
  };
}

export function executeLazy<T>(fn: () => T): Lazy<T> {
  return {
    type: "func",
    v: () => {
      return {
        type: "val",
        v: fn(),
      };
    },
  };
}

// This is the function that makes lazy a Monad which means we can now chain operations of lazy values
// In other words this means i can create a promise to apply a function to result of this promise
// example:
//     apply( lazy(10) , (x) => lazy(1+x))
// this will not actually calculate 1+x but will return a promise to calculate 1+x
// https://en.wikipedia.org/wiki/Monad_(functional_programming)
export function bind<U, T>(u: Lazy<U>, fn: (_: U) => Lazy<T>): Lazy<T> {
  return executeLazy(() => lift(fn(lift(u))));
}

// https://en.wikipedia.org/wiki/Functor_(functional_programming)
export function fmap<T, U>(f: (_: T) => U, x: Lazy<T>): Lazy<U> {
  return applicative(unit(f), x);
}
// applicative
// https://en.wikipedia.org/wiki/Applicative_functor
export function applicative<T, U>(
  f: Lazy<(_: T) => U>,
  x: Lazy<T>,
): Lazy<U> {
  return bind(f, (fn) => bind(x, (val) => unit(fn(val))));
}

export function pure<U>(x: U): Lazy<U> {
  return unit(x);
}

// lift will unwrap a string of lazy values and return its final value
export function lift<T>(x: Lazy<T>): T {
  if (x.type === "val") {
    return x.v;
  }
  return lift(x.v());
}
