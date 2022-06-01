# MONADJS

Some typescript code related to monas to help me learn what monads, functors and
applicatives are.

So far this implements a type-safe infinite list of Fibonacci numbers with the
help of a Maybe monad, a Lazy monad and a LinkedList implemented with both.

## Maybe<T>

Maybe is a monad that encapsulates a value either being of type T or undefined.
Maybe makes it possible to create chains of transformations on a value that
might not complete. For example, a file system read might not return a value and
encapsulating this in maybe forces the programmer (through the type system) to
handle it.

example:

```ts
const userID = maybeID(); // 50% chance of returning a number
const userIDNumber = fmap(parseInt, userID); // apply parseint to the possible userid
const userIDTimesTwo = fmap((x) => x * 2, userIDNumber); // multiply the possible parsed userid by 2
if (userIDTimesTwo.type === "nothing") {
  console.log("couldn't get userid");
} else {
  console.log(`userid is ${userIDTimesTwo}`);
}
```

## Lazy<T>

Lazy is a monad that encapsulates delayed execution of code. Instead of
immediately calculating the result of a function it will chain promises together
until the value is used. By doing this we will only calculate the result of
functions we actualy use in our code. For example, we might make a list of HTTP
calls where we end up only using the first 2 calls. If we use Lazy we can
construct the list completely without having to do each HTTP call

example:

```ts
// first initialize a lazy value
const lazyString = lazy("2");
// transform the string into a number
// at this point `parseInt` won't be called
const a = bind(aString, (x) => lazy(parseInt(x)));

// multiple the value by two
// at this point both parseInt and *2 won't have been called yet
const double = fmap((x) => x * 2, a);

// create a new lazy value and add it to the doubled value
const b = lazy(4);
const add = applicative(
  fmap((x) => (y: number) => x + y, b),
  double,
);

// at this point neither parseInt, *2 and double+b will have been called yet
// after lifing the value `add` we will be calculating the actual functions
// and return the result of the chain of promises
const result = lift(add);
```

## LinkedList<T>

LinkedList is a linked list implemented as a lazy value. This means each next
value will only be calculated at execution time. This allows us to use the
LinkedList to define values with infinite ranges (like an infinite list of
Fibonacci numbers). As an experiment, we implement a LinkedList node being
either a Node or the end of the list with the Maybe monad. Combing both the
laziness and the optional value we get a definition of `Lazy<Maybe<Node<T>>>`.
This means that a LinkedList is a promise to return a value that is either a
empty list, `maybe.Nothing`, or a node with a next item.

example:

```ts
Deno.test("Test example in Readme", () => {
  const cc = new CallCounter(); // this will keep track of actual excecution
  // create a list of 3 numbers
  const list = linkedList(1, linkedList(2, linkedList(3)));
  // multiply each item in the list times 2
  const multiplied = map(list, (x) => cc.call(() => x * 2));

  // at this point multiplied is still a promise to multiple each value
  // to demonstrate this we create a infinite list starting at 1 incremented with 1
  const inf = infinite(0, 1);
  // we do the same multiplication
  const infMultiplied = map(inf, (x) => cc.call(() => x * 2));

  // now we combine both list together by appending the infinite list to the right of the firs
  // note that the other way is possible but will never reach the end of the left infinite list :p
  const combined = concat(multiplied, infMultiplied);

  // to demonstrate the combined list we sum the first 5 entries, of which 2 are in the infinite list,
  // with take and fold
  const sumOfFirst5 = lFold(
    (acc, x) => cc.call(() => acc + x),
    0,
    take(combined, 5),
  );

  // at this point sumOfFirst5 will be of type Lazy<number>
  // and none of the multiplication will have actually been excecute
  // only after we lift the value of sumOfFirst5 the concatation and multuplication will be done
  asserts.assertEquals(cc.count, 0); // verify no multiplications where made
  const result = lift(sumOfFirst5);
  asserts.assertEquals(cc.count, 10); // 3 multiplications in the first list, 2 in the second and 5 sums
  asserts.assertEquals(
    result,
    14,
  ); // sum of [1*2,2*2,3*2, 0*2,1*2] = 14

  // The same code without comments and the call counter adding syntax complexity
  const _l = map(arrayToLinkedList([1, 2, 3]), (x) => x * 2);
  const _inf = map(infinite(0, 1), (x) => cc.call(() => x * 2));
  const _sum = lFold((acc, x) => acc + x, 0, take(concat(_l, _inf), 5));
  asserts.assertEquals(lift(_sum), 14);
});
```

# Setup

setup nix (https://nixos.org/download.html) and run

```
nix-shell -p env.nix
```

This will also configure the `.vscode/settings.json` to enable use the nix
installed version of deno and setup formatting on save

or install deno (https://deno.land/manual/tools/formatter) yourself

## Run

to run the main.ts examples run:

```
deno run main.ts
```

## Testing

The test code also contains examples on how to use the monads

```
deno test
```

## linting / formating

```
deno lint
deno fmt
```
