export function compose<A,B,C>(fn: (a:A,b:B) => C, a:A): (b:B) => C {
    return (b) => {
        return fn(a,b)
    }
} 