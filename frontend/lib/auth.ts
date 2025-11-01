import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { API_ENDPOINTS } from "../config/api"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        ci: { label: "Cédula", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.ci || !credentials?.password) {
          return null
        }

        try {
          const response = await fetch(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ci: credentials.ci,
              password: credentials.password,
            }),
          })

          const data = await response.json();
          const { user, token } = data.data;

          if (response.ok && data.success && data.data) {
            return {
              id: user.ci,
              ci: user.ci,
              name: user.name,
              email: user.email,
              role: user.role,
              description: user.description,
              pictureUrl: user.pictureUrl,
              accessToken: token,
            }
          }

          return null
        } catch (error) {
          console.error('Error during authentication:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.ci = user.ci
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.description = user.description
        token.pictureUrl = user.pictureUrl
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.ci = token.ci
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role
        session.user.description = token.description
        session.user.pictureUrl = token.pictureUrl
        session.accessToken = token.accessToken
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
