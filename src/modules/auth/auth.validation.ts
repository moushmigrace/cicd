export function validateRegister(
    email: string,
    password: string,
    name: string
  ) {
    if (!email || !password || !name) {
      throw new Error('INVALID_INPUT')
    }
  }
  
  export function validateLogin(email: string, password: string) {
    if (!email || !password) {
      throw new Error('INVALID_INPUT')
    }
  }
  