import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 25,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.01'],
  },
}

const BASE_URL = 'http://localhost:3000'
const EMAIL = 'bob@test.com'
const PASSWORD = '123456'

export function setup() {
  console.log('----------------------------------------')
  console.log('AUTH LOAD TEST STARTING')
  console.log('Endpoint  : POST /api/auth/login')
  console.log('Users     : 25 concurrent users')
  console.log('Duration  : 30 seconds')
  console.log('Threshold : p95 < 5s, failures < 1%')
  console.log(`Test User : ${EMAIL}`)
  console.log('----------------------------------------')

  // Register user ONCE before load starts
  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      name: 'Load User',
      email: EMAIL,
      password: PASSWORD,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  if (registerRes.status === 200) {
    console.log('✔ Test user registered successfully')
  } else {
    console.log('ℹ Test user already exists or registration skipped')
  }

  console.log('✔ Starting login load test...\n')

  return { email: EMAIL, password: PASSWORD }
}

export default function (data) {
  const payload = JSON.stringify({
    email: data.email,
    password: data.password,
  })

  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  )

  check(res, {
    'login status 200': r => r.status === 200,
  })

  sleep(1)
}