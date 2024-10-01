// url_test.ts
import { asserts } from "../deps.ts";
import {
  applicative,
  bind,
  fmap,
  justType,
  Maybe,
  nothing,
  nothingType,
  unit,
} from "./maybe.ts";
import { compose, mult } from "./utils.ts";

Deno.test("should be able to use bind to multiply a value", () => {
  const a = unit(2);
  const multiplied = bind(a, (x) => unit(x * 2));

  if (multiplied.type === justType) {
    asserts.assertEquals(multiplied.val, 4);
  } else {
    asserts.assertEquals(multiplied.type, nothingType);
  }
});

Deno.test("Example without functor and applicative", () => {
  const a = Math.random() > 0.5 ? unit(2) : nothing;
  const b = Math.random() > 0.5 ? unit(2) : nothing;
  const multiplied = bind(a, (x) => bind(b, (y) => unit(x * y)));

  if (multiplied.type === justType) {
    asserts.assertEquals(multiplied.val, 4);
  } else {
    asserts.assertEquals(multiplied.type, nothingType);
  }
});

Deno.test("Example with functor and applicative", () => {
  const a = Math.random() > 0.5 ? unit(2) : nothing;
  const b = Math.random() > 0.5 ? unit(2) : nothing;

  const multiplieByA = fmap((x) => (y: number) => x * y, a);
  const multiplied = applicative(multiplieByA, b);

  if (multiplied.type === justType) {
    asserts.assertExists(multiplied.val);
  } else {
    asserts.assertEquals(multiplied.type, nothingType);
  }
});

Deno.test("Example with functor, applicative and compose", () => {
  const a = Math.random() > 0.5 ? unit(2) : nothing;
  const b = Math.random() > 0.5 ? unit(2) : nothing;

  const multiplieByA = fmap(compose(mult), a);
  const multiplied = applicative(multiplieByA, b);

  if (multiplied.type === justType) {
    asserts.assertExists(multiplied.val);
  } else {
    asserts.assertEquals(multiplied.type, nothingType);
  }
});

Deno.test("Can multiple maybe val with functor", () => {
  const x = unit(2);
  const multiplied = fmap((y) => y * 2, x);
  asserts.assertEquals(multiplied.type, justType);
  if (multiplied.type === nothingType) {
    throw Error("type should be val instead of Nothing");
  }
  asserts.assertEquals(multiplied.val, 4);
});

Deno.test("Can multiple maybe nothing with functor", () => {
  const x = nothing as Maybe<number>;
  const _ = fmap((y) => y * 2, x);
  asserts.assertEquals(x.type, nothingType);
});

Deno.test("Can multiple 2 maybe values with applicative and functor", () => {
  const a = unit(2);
  const b = unit(4);
  const mult = applicative(fmap((x) => (y: number) => x * y, a), b);
  if (mult.type === nothingType) {
    throw Error("expected mult to have a value");
  }
  asserts.assertEquals(mult.val, 2 * 4);
});

function maybeID(): Maybe<string> {
  if (Math.random() >= 0.5) {
    return nothing;
  }

  const val = (Math.random() * 100).toString();

  return unit(val);
}

Deno.test("Can run example showing how maybe applicative and functor can be used to handle maybes that are randomly nothing", () => {
  for (let i = 0; i < 100; i++) {
    const userID = maybeID(); // 50% chance of returning a string
    const userIDNumber = fmap(parseInt, userID); // apply parseint to the possible userid
    const userIDTimesTwo = fmap((x) => x * 2, userIDNumber);

    const otherUserID = maybeID();
    const otherUserIDMumber = fmap(parseInt, otherUserID);
    const multiplyOfMaybes = applicative(
      fmap(
        (x) => compose(mult)(x), // mult == *
        otherUserIDMumber,
      ),
      userIDNumber,
    );

    if (userID.type === justType) {
      asserts.assertEquals(userIDTimesTwo.type, justType);

      if (otherUserID.type == justType) {
        asserts.assertEquals(multiplyOfMaybes.type, justType);
      } else {
        asserts.assertEquals(multiplyOfMaybes.type, nothingType);
      }
    } else {
      asserts.assertEquals(userIDTimesTwo.type, nothingType);
    }
  }
});
