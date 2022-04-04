
export const Nothing = "nothing"
export const Val = "val"
export type Maybe<T> = { type: "val", val: T } | { type: "nothing" }

export function maybe<T>(x: T): Maybe<T> {
  if (x === undefined) {
      return { type: Nothing}
  }
  return { type: Val, val: x}
}

export function apply<T, U>(x: Maybe<T>, f: (x: T) => U): Maybe<U> {
    if (x.type === Nothing) {
        return x
    }

    return maybe(f(x.val))
}

// example
function maybeID(): Maybe<string> {
    if (Math.random() >= 0.5) {
        return maybe(undefined)
    }
    
    return maybe((Math.random() * 100).toString())
}

// for (let i = 0; i < 100; i++) {
//     const userID = maybeID()
//     const userIDNumber = apply(userID, parseInt)
//     const userIDTimesTwo = apply(userIDNumber, (x) => x*2)
    
//     if(userIDTimesTwo.type == Nothing) {
//         console.log("couldn't get userid") 
//         continue
//     }

//     console.log(`user id * 2 was: ${userIDTimesTwo.val}`)
// }