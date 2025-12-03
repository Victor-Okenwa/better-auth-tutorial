import { createAuthClient } from "better-auth/react"
import { auth } from "./auth"
import { adminClient, inferAdditionalFields, organizationClient, twoFactorClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client";
import { ac, user, admin } from "@/components/auth/permissions";

export const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>(), twoFactorClient({
        onTwoFactorRedirect: () => {
            window.location.href = "/auth/2fa";
        }
    }),
    passkeyClient(), adminClient({
        ac,
        roles: {
            user,
            admin,
        }
    }),
    organizationClient()
    ]

})