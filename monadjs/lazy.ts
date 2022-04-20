// Lazy<T> is a type that is either
//   1) a value
//   2) a function that returns a lazy value
// Having this circular type means we can chain promises of promises which
// i promise wil not be the worst idea in this script
export type Lazy<T> = { type: "val"; v: T } | {
  type: "func";
  v: () => Lazy<T>;
};

// constructor for the value type (so an actual value)
export function lazy<T>(x: T): Lazy<T> {
  return { type: "val", v: x };
}
// constructor for the function type (so a promise to return a value)
export function lazyf<T>(fn: () => Lazy<T>): Lazy<T> {
  return { type: "func", v: fn };
}

// This is the function that makes lazy a Monad which means we can now chain operations of lazy values
// In other words this means i can create a promise to apply a function to result of this promise
// example:
//     apply( lazy(10) , (x) => lazy(1+x))
// this will not actually calculate 1+x but it with
// https://en.wikipedia.org/wiki/Monad_(functional_programming)
export function bind<U, T>(u: Lazy<U>, fn: (v: U) => Lazy<T>): Lazy<T> {
  if (u.type === "val") {
    return lazyf(() => fn(u.v));
  }
  return lazyf(() => bind(u.v(), fn));
}

// https://en.wikipedia.org/wiki/Functor_(functional_programming)
export function fmap<U, T>(fn: (v: U) => T, u: Lazy<U>): Lazy<T> {
  if (u.type === "val") {
    return lazyf(() => lazy(fn(u.v)));
  }
  return lazyf(() => fmap(fn, u.v()));
}

// applicative
// https://en.wikipedia.org/wiki/Applicative_functor
export function applicative<T, U>(fn: Lazy<(x: T) => U>, x: Lazy<T>): Lazy<U> {
  return pure(() => lift(fn)(lift(x)));
}

export function pure<U>(x: () => U): Lazy<U> {
  return lazyf(() => lazy(x()));
}

// example that shows "tickv{step}" console.log will only
// be called when we call `lift` on the lazy value
// const v = lazy(10)
// const v2 = apply(v, (x) => { console.log("tickv2");  return x*2 })
// const v3 = apply(v2, (x) => { console.log("tickv3"); return x.toString() })
// const v4 = apply(v3,  (x) => { console.log("tickv4"); return `${x}-string` })
// console.log("no tick")
// console.log("start unwrapping")
// console.log(lift(v4))

// lift will unwrap a string of lazy values and return its final value
export function lift<T>(x: Lazy<T>): T {
  if (x.type === "val") {
    return x.v;
  }
  return lift(x.v());
}

export function sh<T, U, X>(a: Lazy<T>, b: Lazy<U>, fn: (T, U) => X): Lazy<X> {
  return lazyf(() => {
    return lazy(fn(lift(a), lift(b)));
  });
}
