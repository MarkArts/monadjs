# MONADJS

Some typescript code related to monas to help me learn what monads, functors and
applicatives are.

So far this implements a maybe monad and a lazy monad with which i implement a
infinite linked list which can be mapped an folded over.

# Setup

setup nix (https://nixos.org/download.html) and run

```
nix-shell -p env.nix
```

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
