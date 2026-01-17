import dotenv from 'dotenv'
import { execSync } from 'child_process'

dotenv.config({ path: '.env.test' })

beforeAll(() => {
  // Ensure test DB schema exists
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  })
})
