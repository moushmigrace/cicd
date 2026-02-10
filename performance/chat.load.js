import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 30 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'],
  },
}

const BASE_URL = 'http://localhost:3000'
const PASSWORD = '123456'

export function setup() {
  console.log('----------------------------------------')
  console.log('CHAT LOAD TEST STARTING')
  console.log('Feature   : Private Chat (Send & Fetch)')
  console.log('Endpoints :')
  console.log('  - POST /api/chats/send')
  console.log('  - GET  /api/chats/fetch')
  console.log('Users     : Ramp 10 → 30 concurrent users')
  console.log('Duration  : ~50 seconds')
  console.log('SLA       : p95 latency < 400ms')
  console.log('Setup     : Create users, connect them')
  console.log('----------------------------------------')

  const emailA = `chat_a_${Date.now()}@test.com`
  const emailB = `chat_b_${Date.now()}@test.com`

  // Register users
  http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'Chat A',
    email: emailA,
    password: PASSWORD,
  }), { headers: { 'Content-Type': 'application/json' } })

  const regB = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'Chat B',
    email: emailB,
    password: PASSWORD,
  }), { headers: { 'Content-Type': 'application/json' } })

  const userBId = regB.json('user.id')

  // Login A
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: emailA,
    password: PASSWORD,
  }), { headers: { 'Content-Type': 'application/json' } })

  const token = loginRes.json('token')
  const userAId = loginRes.json('user.id')

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-user-id': userAId,
    },
  }

  // Create and accept connection
  http.post(
    `${BASE_URL}/api/connections/send`,
    JSON.stringify({ receiverId: userBId }),
    authHeaders
  )

  http.post(
    `${BASE_URL}/api/connections/accept`,
    JSON.stringify({ senderId: userAId }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-user-id': userBId,
      },
    }
  )

  console.log('✔ Setup completed: users connected')
  console.log('✔ Starting chat load test...\n')

  return { token, userAId, userBId }
}

export default function (data) {
  const headers = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
      'x-user-id': data.userAId,
    },
  }

  // SEND MESSAGE
  const sendRes = http.post(
    `${BASE_URL}/api/chats/send`,
    JSON.stringify({
      receiverId: data.userBId,
      content: `k6 message ${__ITER}`,
    }),
    headers
  )

  check(sendRes, {
    'send responded': r => r.status !== 500,
  })

  // FETCH MESSAGES
  const fetchRes = http.get(
    `${BASE_URL}/api/chats/fetch?friendId=${data.userBId}`,
    headers
  )

  check(fetchRes, {
    'fetch status 200': r => r.status === 200,
  })

  sleep(1)
}