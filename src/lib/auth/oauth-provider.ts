export const SUPPORTED_OAUTH_PROVIDERS = ["github", "discord"];
import { DiscordIcon, GithubIcon } from "../../../icons/auth/oauth-icons";
import type { ElementType, ComponentProps } from "react";

export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDERS_DETAILS: Record<
    SupportedOAuthProvider,
    {
        name: string;
        icon: ElementType<ComponentProps<"svg">>;
    }
> = {
    github: {
        name: "GitHub",
        icon: GithubIcon,
    },
    discord: {
        name: "Discord",
        icon: DiscordIcon,
    },
};
