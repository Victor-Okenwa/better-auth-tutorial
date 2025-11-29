import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to our App</h1>
      <Button size="lg" variant="outline" className="w-full max-w-md capitalize">sign in/sign up</Button>
    </main>
  );
}
