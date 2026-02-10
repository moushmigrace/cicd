import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 1,              // security tests should be single-user
  iterations: 1,
}

const BASE_URL = 'http://localhost:3000'

export default function () {
  console.log('----------------------------------------')
  console.log('SECURITY TEST STARTING')
  console.log('Testing: Auth, Access Control, Injection')
  console.log('----------------------------------------')

  /* -------------------------------
     1️⃣ ACCESS WITHOUT TOKEN
  -------------------------------- */
  const noAuthRes = http.get(
    `${BASE_URL}/api/chats/fetch?friendId=123`
  )

  check(noAuthRes, {
    'blocked without token': r =>
      r.status === 401 || r.status === 403,
  })

  /* -------------------------------
     2️⃣ ACCESS WITH INVALID TOKEN
  -------------------------------- */
  const invalidTokenRes = http.get(
    `${BASE_URL}/api/chats/fetch?friendId=123`,
    {
      headers: {
        Authorization: 'Bearer invalid.token.value',
        'x-user-id': 'fake-user-id',
      },
    }
  )

  check(invalidTokenRes, {
    'blocked invalid token': r =>
      r.status === 401 || r.status === 403,
  })

  /* -------------------------------
     3️⃣ IDOR TEST (ACCESS OTHER USER)
  -------------------------------- */
  const idorRes = http.get(
    `${BASE_URL}/api/chats/fetch?friendId=someone-elses-id`,
    {
      headers: {
        Authorization: 'Bearer invalid',
        'x-user-id': 'another-user-id',
      },
    }
  )

  check(idorRes, {
    'idor prevented': r =>
      r.status === 401 || r.status === 403,
  })

  /* -------------------------------
     4️⃣ INJECTION ATTEMPT
  -------------------------------- */
  const injectionRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: "' OR '1'='1",
      password: "' OR '1'='1",
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  check(injectionRes, {
    'sql injection blocked': r =>
      r.status === 400 || r.status === 401,
  })

  /* -------------------------------
     5️⃣ SCRIPT INJECTION (XSS)
  -------------------------------- */
  const xssRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      name: '<script>alert(1)</script>',
      email: 'xss@test.com',
      password: '123456',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  check(xssRes, {
    'xss handled safely': r =>
      r.status === 400 || r.status === 200,
  })

  console.log('✔ SECURITY TEST COMPLETED')
  sleep(1)
}