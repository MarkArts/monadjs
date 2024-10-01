// url_test.ts
import { asserts } from "../deps.ts";
import { applicative, fmap, just, Maybe, nothing, unit } from "./maybe.ts";
import { compose } from "./utils.ts";

Deno.test("Example without functor", () => {
  const x = unit(Math.random() > 0.5 ? 2 : undefined);
  if (x.type == just) {
    const y = unit(Math.random() > 0.5 ? 2 : undefined);
    if (y.type == just) {
      const multiplied = x.val * y.val;
      asserts.assertExists(multiplied);
    }
  }
});

Deno.test("Exmaple with functor and applicative", () => {
  const x = unit(Math.random() > 0.5 ? 2 : undefined);
  const y = unit(Math.random() > 0.5 ? 2 : undefined);
  const multiplied = applicative(fmap((x) => (y: number) => x * y, x), y);

  if (multiplied.type === just) {
    asserts.assertExists(multiplied.val);
  } else {
    asserts.assertEquals(multiplied.type, nothing);
  }
});

Deno.test("Can multiple maybe val with functor", () => {
  const x = unit(2);
  const multiplied = fmap((y) => y * 2, x);
  asserts.assertEquals(multiplied.type, just);
  if (multiplied.type === nothing) {
    throw Error("type should be val instead of Nothing");
  }
  asserts.assertEquals(multiplied.val, 4);
});

Deno.test("Can multiple maybe nothing with functor", () => {
  const x = unit<number>(undefined);
  const _ = fmap((y) => y * 2, x);
  asserts.assertEquals(x.type, nothing);
});

Deno.test("Can multiple 2 maybe values with applicative and functor", () => {
  const a = unit(2);
  const b = unit(4);
  const mult = applicative(fmap((x) => (y: number) => x * y, a), b);
  if (mult.type === nothing) {
    throw Error("expected mult to have a value");
  }
  asserts.assertEquals(mult.val, 2 * 4);
});

function maybeID(): Maybe<string> {
  if (Math.random() >= 0.5) {
    return unit<string>(undefined);
  }

  const val = (Math.random() * 100).toString();

  return unit(val);
}

const mult = (a: number, b: number) => a * b;

Deno.test("Can run example showing how maybe applicative and functor can be used to handle maybes that are randomly nothing", () => {
  for (let i = 0; i < 100; i++) {
    const userID = maybeID(); // 50% chance of returning a string
    const userIDNumber = fmap(parseInt, userID); // apply parseint to the possible userid
    const userIDTimesTwo = fmap((x) => x * 2, userIDNumber);

    const otherUserID = maybeID();
    const otherUserIDMumber = fmap(parseInt, otherUserID);
    const multiplyOfMaybes = applicative(
      fmap(
        (x) => compose(mult, x), // mult == *
        otherUserIDMumber,
      ),
      userIDNumber,
    );

    if (userID.type === just) {
      asserts.assertEquals(userIDTimesTwo.type, just);

      if (otherUserID.type == just) {
        asserts.assertEquals(multiplyOfMaybes.type, just);
      } else {
        asserts.assertEquals(multiplyOfMaybes.type, nothing);
      }
    } else {
      asserts.assertEquals(userIDTimesTwo.type, nothing);
    }
  }
});
