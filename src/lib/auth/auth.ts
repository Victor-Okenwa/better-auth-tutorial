import { db } from "@/drizzle/db";
import { betterAuth, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "../email/password-reset";
import { sendEmailVerificationEmail } from "../email/email-verification";
import { sendWelcomeEmail } from "../email/welcome-email";
import { createAuthMiddleware } from "better-auth/api";
import { sendDeleteAccountVerificationEmail } from "../email/delete-account-verification";
import { admin as adminPlugin, organization as organizationPlugin, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { ac, user, admin } from "@/components/auth/permissions";
import { sendOrganizationInviteEmail } from "../email/organization-invite";
import { member } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
})

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
        passkey(),
        adminPlugin({
            // defaultRole: "user"
            ac,
            roles: {
                user,
                admin,
            }
        }),
        organizationPlugin({
            sendInvitationEmail: async ({ invitation, inviter, organization, email }) => {
                await sendOrganizationInviteEmail({ invitation, inviter: { name: inviter.user.name ?? "" }, organization: { name: organization.name ?? "" }, email: invitation.email ?? "" })
            }
        }),
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
        })
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
    databaseHooks: {
        session: {
            create: {
                before: async userSession => {
                    const membership = await db.query.member.findFirst({
                        where: eq(member.userId, userSession.userId),
                        orderBy: desc(member.createdAt),
                        columns: {
                            organizationId: true,
                        },
                    });

                    return {
                        data: {
                            ...userSession,
                            activeOrganizationId: membership?.organizationId ?? null,
                        }
                    }
                }
            },
        },
    }
});