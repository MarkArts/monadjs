export class CallCounter {
  count: number;

  constructor() {
    this.count = 0;
  }

  call<T>(fn: () => T): T {
    this.count++;
    return fn();
  }
}
