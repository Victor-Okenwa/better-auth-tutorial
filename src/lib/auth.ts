import { db } from "@/drizzle/db";
import { betterAuth, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "./email/password-reset";
import { sendEmailVerificationEmail } from "./email/email-verification";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
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
        },
        discord: {
            enabled: true,
            clientId: process.env.DISCORD_CLIENT_ID || "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
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
    ],
    rateLimit: {
        storage: "database",
    }
    // socialProviders: {
    //     google: {
    //         enabled: true,
    //     },
    // },
});