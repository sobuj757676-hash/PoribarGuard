import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // 7 days
    pages: {
        signIn: "/en/login", // Default language path
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
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
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                    });

                    if (existingUser) {
                        // User exists, allow sign in
                        // Attach id and role to user object so jwt callback can use them
                        user.id = existingUser.id;
                        user.role = existingUser.role;
                        return true;
                    }

                    // New user via Google: create account and trial subscription
                    const trialDaysConfig = await prisma.systemConfig.findUnique({ where: { key: "trial_days" } });
                    const trialDays = trialDaysConfig ? parseInt(trialDaysConfig.value) || 7 : 7;
                    const trialEndDate = new Date();
                    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

                    const newUser = await prisma.$transaction(async (tx) => {
                        const createdUser = await tx.user.create({
                            data: {
                                name: user.name || "Google User",
                                email: user.email,
                                passwordHash: "OAUTH", // Marker for oauth
                                role: "PARENT",
                                avatarUrl: user.image,
                            },
                        });

                        await tx.subscription.create({
                            data: {
                                userId: createdUser.id,
                                plan: "TRIAL",
                                status: "ACTIVE",
                                billingCycle: "MONTHLY",
                                amount: 0,
                                startDate: new Date(),
                                endDate: trialEndDate,
                                autoRenew: false,
                            },
                        });

                        return createdUser;
                    });

                    // Attach id and role to user object
                    user.id = newUser.id;
                    user.role = newUser.role;
                    return true;
                } catch (error) {
                    console.error("Error during Google sign-in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // When user logs in, user object is provided
            if (user) {
                // For Google login, user object from signIn callback already has correct id and role
                // For credentials, authorize returns it
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
