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

export const login = asnyc (username: string, password: string, ip: string) => {
  const user = await db.getUser(username)
  if(!user) {
    return Err('WRONG_PASSWORD')
  }

  const isEqual = compareHash(dbUser.password, password)

  if(!isEqual) {
    return Err('WRONG_PASSWORD')
  }

  if(loginRateLimited(username, ip)) {
    return Err('RATE_LIMITED')
  }

  return Ok(user)
}


// ...

const [user, err] = await login('user', 'password', 127.0.0.0)

if(err) {
  /* 
    Type narrowing means the result be automatically typed correctly
    So here `user` will undefined, while err will be an Err object that the code field with string literal union of  'WRONG_PASSWORD' | 'RATE_LIMITED'
  */
} else {
  /*
    result is the User object, and will be typed to it.
    err here will equal type undefined
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


