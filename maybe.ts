import { compose } from "./utils"

export const Nothing = "nothing"
export const Val = "val"
export type Maybe<T> = { type: "val", val: T } | { type: "nothing" }

export function maybe<T>(x: T): Maybe<T> {
  if (x === undefined) {
      return { type: Nothing}
  }
  return { type: Val, val: x}
}

export function bind<T, U>(x: Maybe<T>, f: (x: T) => Maybe<U>): Maybe<U> {
    if (x.type === Nothing) {
        return x
    }

    return f(x.val)
}

export function fmap<T, U>(f: (x: T) => U, x: Maybe<T>): Maybe<U> {
    if (x.type === Nothing) {
        return x
    }

    return maybe(f(x.val))
}

export function applicative<T,U>(f: Maybe<(x: T) => U>, x: Maybe<T>): Maybe<U> {
    if (f.type === Nothing) {
        return f
    }

    if (x.type === Nothing) {
        return x
    }

    return maybe( f.val(x.val) )
}

// example
function maybeID(): Maybe<string> {
    if (Math.random() >= 0.5) {
        return maybe(undefined)
    }
    
    return maybe((Math.random() * 100).toString())
}

// * is not usuable as function argument for (a,b) => c
const mult = (a,b) => a*b

for (let i = 0; i < 100; i++) {
    const userID = maybeID() // 50% chance of returning a number
    const userIDNumber = fmap(parseInt, userID) // apply parseint to the possible userid
    const userIDTimesTwo = fmap((x) => x*2, userIDNumber)
    

    const otherUserID = fmap(parseInt, maybeID())
    const multiplyOfMaybes = applicative( 
                                fmap( (x) => compose(mult, x),  // mult == *
                                otherUserID), userIDNumber)
    
    if(userIDTimesTwo.type === Nothing) {
        console.log("userIDTimeTwo was nothing")
        continue
    }

    if(multiplyOfMaybes.type === Nothing) {
        console.log("multiplyOfMaybes was nothing")
        continue
    }

    console.log(`userIDTimesTwo was ${userIDTimesTwo.val}; multiplyOfMaybes was ${multiplyOfMaybes.val}`)
}