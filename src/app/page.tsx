"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    (!session ? (
      <main className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Welcome to our App</h1>
        <Button size="lg" variant="outline" className="w-full max-w-md capitalize" asChild>
          <Link href="/auth/login">sign in/sign up</Link>
        </Button>
      </main>
    ) : (
      <main className="flex flex-col items-center justify-center h-screen">
        <h1>Welcome {session.user?.name}</h1>
        <BetterAuthActionButton size="lg" variant="destructive" className="w-full max-w-md capitalize" action={() => authClient.signOut()}>sign out</BetterAuthActionButton>
      </main>
    ))

  );
}
