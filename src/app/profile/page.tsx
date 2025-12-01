import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth/auth";
import { ArrowLeft, Key, LinkIcon, Shield, Trash2, User } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileUpdateForm } from "./_components/profile-update-form";
import { SetPasswordButton } from "./_components/set-password-button";
import { Suspense } from "react";
import { ChangePasswordForm } from "./_components/change-password-form";
import { SessionManagement } from "./_components/session-mananagement";
import { AccountLinking } from "./_components/account-linking";
import { AccountDeletion } from "./_components/account-deletion";

export default async function ProfilePage() {

    const session = await auth.api.getSession({ headers: await headers() })

    if (session === null) {
        redirect("/auth/login");
    }



    return (
        <div className="max-w-4xl mx-auto my-6 px-4">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center mb-6">
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Home
                </Link>
                <div className="flex items-center space-x-4">
                    <div className="size-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        {session.user.image ? (
                            <Image
                                width={64}
                                height={64}
                                src={session.user.image}
                                alt="User Avatar"
                                className="object-cover"
                            />
                        ) : (
                            <User className="size-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex gap-1 justify-between items-start">
                            <h1 className="text-3xl font-bold">
                                {session.user.name || "User Profile"}
                            </h1>
                            {/* <Badge>{session.user.role}</Badge> */}
                        </div>
                        <p className="text-muted-foreground">{session.user.email}</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-2">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile">
                        <User />
                        <span className="max-sm:hidden">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield />
                        <span className="max-sm:hidden">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="session">
                        <Key />
                        <span className="max-sm:hidden">Session</span>
                    </TabsTrigger>
                    <TabsTrigger value="accounts">
                        <LinkIcon />
                        <span className="max-sm:hidden">Accounts</span>
                    </TabsTrigger>
                    <TabsTrigger value="danger">
                        <Trash2 />
                        <span className="max-sm:hidden">Danger</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardContent>
                            <ProfileUpdateForm user={session.user} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <LoadingSuspense>
                        <SecurityTab email={session.user.email} />
                    </LoadingSuspense>
                </TabsContent>
                <TabsContent value="session">
                    <LoadingSuspense>
                        <SessionTab currentSessionToken={session.session.token} />
                    </LoadingSuspense>
                </TabsContent>
                <TabsContent value="accounts">
                    <LoadingSuspense>
                        <LinkedAccounts />
                    </LoadingSuspense>
                </TabsContent>
                <TabsContent value="accounts"></TabsContent>
                <TabsContent value="danger">
                    <Card>
                        <CardContent>
                            <AccountDeletion />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};


async function SecurityTab({ email }: { email: string }) {
    const accounts = await auth.api.listUserAccounts({ headers: await headers() });
    const hasAccountPassword = accounts.some(account => account.providerId === "credentials");

    return (
        <div className="space-y-4">
            {hasAccountPassword ? (<Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm email={email} />
                </CardContent>
            </Card>) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Set Password</CardTitle>
                        <CardDescription>We will send you an email to set your password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SetPasswordButton email={email} />
                    </CardContent>
                </Card>
            )}
        </div >
    )
}

async function SessionTab({
    currentSessionToken
}: {
    currentSessionToken: string;
}) {
    const sessions = await auth.api.listSessions({ headers: await headers() });
    // const currentSession = sessions.find(session => session.token === currentSessionToken);

    return (
        <Card>
            <CardContent>
                <SessionManagement sessions={sessions} currentSessionToken={currentSessionToken} />
            </CardContent>
        </Card>
    )
}

async function LinkedAccounts() {
    const accounts = await auth.api.listUserAccounts({ headers: await headers() });
    const nonCredentialsAccounts = accounts.filter(account => account.providerId !== "credentials");
    return (
        <Card>
            <CardContent>
                <AccountLinking accounts={nonCredentialsAccounts} />
            </CardContent>
        </Card>
    )
}

const LoadingSuspense = ({ children }: { children: React.ReactNode }) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    );
};