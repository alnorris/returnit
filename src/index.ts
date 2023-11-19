type ErrorObj<T = unknown, D = unknown> = { code: T; stack: string | undefined, details: D }
type ErrorResult<T = unknown, D = unknown> = [undefined, ErrorObj<T, D>]
type PassResult<T = unknown> = [undefined, T]
type OkResult<T = unknown> = [T, undefined]

type EitherResult<R = unknown, E = unknown> = ErrorResult<E> | OkResult<R>

export const Err = <const T, const D>(code: T, details: D): ErrorResult<T, D> => {
  return [
    undefined,
    {
      code,
      details,
      stack: new Error().stack,
    },
  ]
}

export const PassErr = <const T extends ErrorObj>(result: T): PassResult<T> => {
  return [undefined, result]
}

export const Ok = <T = undefined>(result: T = undefined as T): OkResult<T> => {
  return [result, undefined]
}

export type Result<R = unknown, E = unknown> = Promise<EitherResult<R, E>>

type AwaitedList<T extends readonly unknown[]> = {
  -readonly [P in keyof T]: Awaited<T[P]>
}

type ExtractCodeUnion<T> = T extends {
  code: infer C
  stack: string | undefined
}
  ? C
  : never
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
          if (completed === values.length) {
            return res([results, undefined])
          }
        }
      })
    }
  })
}
