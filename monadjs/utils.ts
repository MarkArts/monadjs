export const compose = <A, B, C>(fn: (a: A, b: B) => C) => (a: A) => (b: B) =>
  fn(a, b);
export const mult = (a: number, b: number) => a * b;
