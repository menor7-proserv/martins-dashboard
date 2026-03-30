import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      empresa: string
    }
  }
  interface User {
    empresa: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    empresa: string
  }
}
