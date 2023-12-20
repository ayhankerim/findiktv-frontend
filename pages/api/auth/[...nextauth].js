import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { signIn } from "../../../services/auth"

export default NextAuth({
  providers: [
    GoogleProvider({
      id: "google",
      name: "google",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      id: "facebook",
      name: "facebook",
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (credentials == null) return null
        try {
          const { user, jwt } = await signIn({
            email: credentials.email,
            password: credentials.password,
          })
          return { ...user, jwt }
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      session.id = token.id
      session.jwt = token.jwt
      return Promise.resolve(session)
    },
    jwt: async ({ token, user }) => {
      const isSignIn = user ? true : false
      if (isSignIn) {
        token.id = user.id
        token.jwt = user.jwt
      }
      return Promise.resolve(token)
    },
  },
})
