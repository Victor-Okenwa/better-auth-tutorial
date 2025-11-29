import { db } from "@/drizzle/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
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
    // socialProviders: {
    //     google: {
    //         enabled: true,
    //     },
    // },
});