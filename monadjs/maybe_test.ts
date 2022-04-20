// url_test.ts
import { asserts } from "../deps.ts";
import { applicative, fmap, Maybe, maybe, Nothing, Val } from "./maybe.ts";
import { compose } from "./utils.ts";

Deno.test("Can multiple maybe val with functor", () => {
  const x = maybe(2);
  const multiplied = fmap((y) => y * 2, x);
  asserts.assertEquals(multiplied.type, Val);
  if (multiplied.type === Nothing) {
    throw Error("type should be val instead of Nothing");
  }
  asserts.assertEquals(multiplied.val, 4);
});

Deno.test("Can multiple maybe nothing with functor", () => {
  const x = maybe<number>(undefined);
  const _ = fmap((y) => y * 2, x);
  asserts.assertEquals(x.type, Nothing);
});

Deno.test("Can multiple 2 maybe values with applicative and functor", () => {
  const a = maybe(2);
  const b = maybe(4);
  const mult = applicative(fmap((x) => (y: number) => x * y, a), b);
  if (mult.type === Nothing) {
    throw Error("expected mult to have a value");
  }
  asserts.assertEquals(mult.val, 2 * 4);
});

function maybeID(): Maybe<string> {
  if (Math.random() >= 0.5) {
    return maybe<string>(undefined);
  }

  const val = (Math.random() * 100).toString();

  return maybe(val);
}

const mult = (a: number, b: number) => a * b;

Deno.test("Can run example showing how maybe applicative and functor can be used to handle maybes that are randomly nothing", () => {
  for (let i = 0; i < 100; i++) {
    const userID = maybeID(); // 50% chance of returning a number
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

    if (userID.type === Val) {
      asserts.assertEquals(userIDTimesTwo.type, Val);

      if (otherUserID.type == Val) {
        asserts.assertEquals(multiplyOfMaybes.type, Val);
      } else {
        asserts.assertEquals(multiplyOfMaybes.type, Nothing);
      }
    } else {
      asserts.assertEquals(userIDTimesTwo.type, Nothing);
    }
  }
});
