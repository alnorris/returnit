class ReturnItError<
  const Code extends string,
  const Details extends unknown,
> extends Error {
  code: Code
  details?: Details

  constructor(code: Code, details?: Details) {
    super(code) // Call the parent constructor with the message

    this.code = this.constructor.name as Code
    this.details = details

    // Capture the stack trace, excluding the constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON() {
    return {
      code: this.code,
      details: this.details,
      stack: this.stack,
    }
  }
}

type ErrorResult<T extends string = string, D = unknown> = [
  undefined,
  ReturnItError<T, D>,
]
type PassResult<T = unknown> = [undefined, T]
type OkResult<T = unknown> = [T, undefined]

export type EitherResult<R = unknown, E extends string = string> =
  | ErrorResult<E>
  | OkResult<R>

export const Err = <const Code extends string, const D>(
  code: Code,
  details?: D,
): ErrorResult<Code, D> => {
  const newError = new ReturnItError(code, details)
  return [undefined, newError]
}

export const PassErr = <
  const Code extends string,
  const Details extends unknown,
  const T extends ReturnItError<Code, Details>,
>(
  result: T,
): PassResult<T> => {
  return [undefined, result]
}

export const Ok = <const T = undefined>(
  result: T = undefined as T,
): OkResult<T> => {
  return [result, undefined]
}

export type Result<R = unknown, E extends string = string> = Promise<
  EitherResult<R, E>
>

type AwaitedList<T extends readonly unknown[]> = {
  -readonly [P in keyof T]: Awaited<T[P]>
}

type ExtractCodeUnion<T> = T extends ReturnItError<infer C, unknown> ? C : never

type ExtractSuccess<T> = T extends [infer S, undefined] ? S : never

type AllResult<T extends Promise<EitherResult>[]> = EitherResult<
  ExtractSuccess<AwaitedList<T>[number]>[],
  ExtractCodeUnion<AwaitedList<T>[number][1]>
>

export const All = <T extends Promise<EitherResult>[]>(
  values: T,
): Promise<AllResult<T>> => {
  const results: ExtractSuccess<AwaitedList<T>[number]>[] = []
  let completed = 0
  return new Promise((res) => {
    for (let i = 0; i < values.length; i++) {
      values[i].then(async (value) => {
        const [result, err] = value
        if (err) return res([undefined, err] as AllResult<T>)
        else {
          results[i] = result as ExtractSuccess<AwaitedList<T>[number]>
          completed += 1
          if (completed === values.length) {
            return res([results, undefined])
          }
        }
      })
    }
  })
}
