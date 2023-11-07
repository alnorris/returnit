# returnit

Stop throwing errors, and return type safe results!

## Features 
- Inferred const types without any explicit returns!
- Golang style returns


## Notes
-	Please have `strictNullChecks` to true in your tsconfig.json


## Install
- `npm i returnit`


## How to use


```ts
import { Ok, Err } from 'returnit'

export const login = (username: string, password: string, ip: string) => {
  const dbUser = await db.getUser(username)
  if(!dbUser) {
    return Err('WRONG_PASSWORD')
  }

  const isEqual = compareHash(dbUser.password, password)

  if(!isEqual) {
    return Err('WRONG_PASSWORD')
  }

  if(loginRateLimited(username, ip)) {
    return Err('RATE_LIMITED')
  }

  return Ok('SUCCESS')
}


// ...

const [result, err] = await login('user', 'password', 127.0.0.0)

if(err) {
  /* 
    Type narrowing means the will be automatically typed
    result equals type: undefined
    err equals a string literal type union:  WRONG_PASSWORD' | 'RATE_LIMITED'
  */
} else {
  /*
    result is a string literal union. 'SUCCESS'
    err equals type undefined
  */
}


```


### All

Works similar to Promise.all, it accepts returnit type functions and executes them concurrently. It will return immediately if one of them returns an error, otherwise will return an array of the successful result.


```ts
import { Ok, Err, All } from 'returnit'


const [result, err] = await All([returnIt1(),returnIt2()])

if(err) {
  /* 
    err returns the first error encountered.
  */
} else {
  /*
    result is an array of the success results
  */
}


```


