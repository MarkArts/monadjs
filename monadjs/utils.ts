export const partial = <A, B, C>(fn: (a: A, b: B) => C) => (a: A) => (b: B) =>
  fn(a, b);

export const mult = (a: number, b: number) => a * b;

export const compose = <A>(fs: ((_: A) => A)[]) => (arg: A) => {
  return fs.reduce((acc, f) => f(acc), arg);
};
