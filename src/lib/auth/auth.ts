import { db } from "@/drizzle/db";
import { betterAuth, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "../email/password-reset";
import { sendEmailVerificationEmail } from "../email/email-verification";
import { sendWelcomeEmail } from "../email/welcome-email";
import { createAuthMiddleware } from "better-auth/api";
import { sendDeleteAccountVerificationEmail } from "../email/delete-account-verification";
import { twoFactor } from "better-auth/plugins";
import { passkey} from "@better-auth/passkey";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    user: {
        changeEmail: {
            enabled: true,
            sendEmailVerificationEmail: async ({ user, url, newEmail }: { user: User, url: string, newEmail: string }) => {
                await sendEmailVerificationEmail({
                    user: {
                        ...user,
                        email: newEmail,
                    }, url
                })
            },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountEmail: async ({ user, url }: { user: User, url: string }) => {
                await sendDeleteAccountVerificationEmail({ user, url });
            },
        },
        additionalFields: {
            favoriteNumber: {
                type: "number",
                required: true,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({ user, url })
        },
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmailVerificationEmail({ user, url })
        },
    },
    socialProviders: {
        github: {
            enabled: true,
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            mapProfileToUser: (profile) => {
                return {
                    favoriteNumber: Number(profile.public_repos ?? 0),
                }
            },
        },
        discord: {
            enabled: true,
            clientId: process.env.DISCORD_CLIENT_ID || "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
            mapProfileToUser: () => {
                return {
                    favoriteNumber: 0,
                }
            },
        },
    },
    session: {
        enabled: true,
        cookieCache: {
            enabled: true,
            strategy: "compact",
            refreshCache: {
                updateAge: 60 * 5, // 5 minutes
            },
        },
    },
    plugins: [
        nextCookies(),
        twoFactor(),
        passkey()
    ],
    rateLimit: {
        storage: "database",
    },
    hooks: {
        after: createAuthMiddleware(async ctx => {
            if (ctx.path.startsWith("/sign-up")) {
                const user = ctx.context.newSession?.user ?? {
                    name: ctx.context.user?.name ?? "",
                    email: ctx.context.user?.email ?? "",
                }
                if (user != null) {
                    await sendWelcomeEmail(user);
                }
            }
        })
    },
});