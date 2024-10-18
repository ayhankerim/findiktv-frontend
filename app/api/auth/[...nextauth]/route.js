import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signIn, userData } from "@/app/utils/auth"

const handler = NextAuth({
    providers: [
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
            const result = await userData({
                jwt: token.jwt,
            })
            session.id = token.id
            session.jwt = token.jwt
            session.user.data = result
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
export { handler as GET, handler as POST };