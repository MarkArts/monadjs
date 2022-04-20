# MONADJS

Some typescript code related to monas to help me learn what monads, functors and
applicatives are.

So far this implements a maybe monad and a lazy monad with which i implement a
infinite linked list which can be mapped an folded over.

## Maybe<T>

Maybe is a monad that encapsulates a value either being of type T or undefined.
Maybe makes it possible to create chains of transformations on value that might
not complete. For example a file system read might not return a value and
encapsulating this in maybe forces the programmer (trough the type system) to
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

Lazy is a monad the encapsulates delayed excecution of code. Instead of
immediately calculating the result of a function it will chain promises together
until the value is used. By doing this we will only calculate the result of
functions we actualy use in our code. For example we might make a list of http
calls where we end up only using the first 2 calls. If we use Lazy we can
contruct the list complelty without having to do each http call

example:

```ts
// first initialize a lazy value
const lazyString = lazy("2");
// transform the string into a number
// at this point `parseInt` won't be called
const a = bind(aString, (x) => lazy(parseInt(x)));

// multiple the value by two
// at this point both parseInt and *2 won't have been called yet
const double = fmap((x) => call(() => x * 2), a);

// create a new lazy value and add it to the doubled value
const b = lazy(4);
const add = applicative(
  fmap((x) => (y: number) => call(() => x + y), b),
  double,
);

// add this point neither parseInt, *2 and double+b will have been called yet
// after lifing the value `add` we will be calculating the actual functions
// and return the result of the chain of
const result = lift(add);
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

The test code alse contains examples on how to use the monads

```
deno test
```

## linting / formating

```
deno lint
deno fmt
```
