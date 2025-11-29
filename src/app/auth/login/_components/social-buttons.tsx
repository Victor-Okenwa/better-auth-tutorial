"use client";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth-client";
import { SUPPORTED_OAUTH_PROVIDERS, SUPPORTED_OAUTH_PROVIDERS_DETAILS } from "@/lib/oauth-provider"

export function SocialButtons() {
    return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
        const Icon = SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].icon;

        return (
            <BetterAuthActionButton key={provider}
                variant="outline"

                action={() => {
                    return authClient.signIn.social({
                        provider,
                        callbackURL: "/",
                    })
                }}
            >
                <Icon className="size-4" />
                {SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].name}
            </BetterAuthActionButton>
        )
    })

}
