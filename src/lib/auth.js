import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // 7 days
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.isActive) return null;

                const isValid = await compare(credentials.password, user.passwordHash);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.avatarUrl,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAdmin = auth?.user?.role === "ADMIN";
            const path = nextUrl.pathname;

            // Protected routes
            if (path.startsWith("/admin")) {
                if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
                if (!isAdmin) return Response.redirect(new URL("/dashboard", nextUrl));
                return true;
            }
            if (path.startsWith("/dashboard")) {
                if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
                return true;
            }

            // Redirect logged-in users away from auth pages
            if (path === "/login" || path === "/register") {
                if (isLoggedIn) {
                    const dest = isAdmin ? "/admin" : "/dashboard";
                    return Response.redirect(new URL(dest, nextUrl));
                }
            }

            return true;
        },
    },
});
