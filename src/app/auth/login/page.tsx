"use client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SignInTab } from "./_components/sign-in-tab";
import { SignUpTab } from "./_components/sign-up-tab";
import { Separator } from "@/components/ui/separator";
import { SocialButtons } from "./_components/social-buttons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { EmailVerificationTab } from "./_components/email-verification-tab";
import { ForgotPasswordTab } from "./_components/forgot-password-tab";

type Tab = "signin" | "signup" | "email-verification" | "forgot-password";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session.data?.user) {
        router.push("/");
      }
    });
  }, [router]);

  function openEmailVerificationTab(email: string) {
    setTab("email-verification");
    setEmail(email);
  }

  function openForgotPasswordTab() {
    setTab("forgot-password");
  }

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="mx-auto mt-12 px-4 my-6" >
      {tab !== "email-verification" && (
        <TabsList>
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
      )}
      <TabsContent value="signin">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <SignInTab openEmailVerificationTab={openEmailVerificationTab} openForgotPasswordTab={openForgotPasswordTab} />

            <Separator />

            <div className="mt-4 [&_button]:w-full flex *:flex-1 gap-2">
              <SocialButtons />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpTab openEmailVerificationTab={openEmailVerificationTab} />
            <Separator />

            <div className="mt-4 [&_button]:w-full flex *:flex-1 gap-2">
              <SocialButtons />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="email-verification">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailVerificationTab email={email} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="forgot-password">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPasswordTab openSignInTab={() => setTab("signin")} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs >
  );
}