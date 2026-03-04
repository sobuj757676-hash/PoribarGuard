import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // 7 days
    pages: {
        signIn: "/en/login", // Default language path
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

            // Handle path parsing to ignore locale segments like /en or /bn
            const isProtectedAdmin = /^\/(en|bn)\/admin/.test(path);
            const isProtectedDashboard = /^\/(en|bn)\/dashboard/.test(path);
            const isAuthPage = /^\/(en|bn)\/(login|register)/.test(path);

            // Determine the locale prefix the user is currently on (defaults to /en)
            const localeMatch = path.match(/^\/(en|bn)/);
            const locale = localeMatch ? localeMatch[0] : '/en';

            if (isProtectedAdmin) {
                if (!isLoggedIn) return Response.redirect(new URL(`${locale}/login`, nextUrl));
                if (!isAdmin) return Response.redirect(new URL(`${locale}/dashboard`, nextUrl));
                return true;
            }

            if (isProtectedDashboard) {
                if (!isLoggedIn) return Response.redirect(new URL(`${locale}/login`, nextUrl));
                return true;
            }

            // Redirect logged-in users away from auth pages
            if (isAuthPage) {
                if (isLoggedIn) {
                    const dest = isAdmin ? `${locale}/admin` : `${locale}/dashboard`;
                    return Response.redirect(new URL(dest, nextUrl));
                }
            }

            return true;
        },
    },
});
