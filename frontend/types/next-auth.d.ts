import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      ci: string
      name: string
      email: string
      role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'
      description?: string
      pictureUrl?: string
    }
    accessToken: string
  }

  interface User {
    id: string
    ci: string
    name: string
    email: string
    role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'
    description?: string
    pictureUrl?: string
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    ci: string
    name: string
    email: string
    role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'
    description?: string
    pictureUrl?: string
    accessToken: string
  }
}
