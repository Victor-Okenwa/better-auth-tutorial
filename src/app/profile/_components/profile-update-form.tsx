"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { NumberInput } from "@/components/ui/number-input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v3";

export const profileUpdateSchema = z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(1, "Name is required"),
    favoriteNumber: z.number().int().min(1, "Favorite number must be at least 1"),
});

type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;

export const ProfileUpdateForm = ({ user }: { user: { email: string, name: string, favoriteNumber: number } }) => {
    const router = useRouter();
    const form = useForm<ProfileUpdateSchema>({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues: {
            email: user.email,
            name: user.name,
            favoriteNumber: user.favoriteNumber,
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(data: ProfileUpdateSchema) {
        const promises = [authClient.updateUser({
            name: data.name,
            favoriteNumber: data.favoriteNumber,
        })];

        if (data.email !== user.email) {
            promises.push(authClient.changeEmail({
                newEmail: data.email,
                callbackURL: "/profile",
            }));
        }

        const res = await Promise.all(promises);
        const updateUserResult = res[0];
        const emailResult = res[1] ?? { error: false };

        if (updateUserResult.error) {
            toast.error("Failed to update profile");
            return;
        } else if (emailResult.error) {
            toast.error("Failed to change email");
            return;
        } else {
            toast.success("Profile updated successfully");
            router.push("/");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="favoriteNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Favorite Number</FormLabel>
                            <FormControl>
                                <NumberInput
                                    {...field}
                                    min={1}
                                    max={100}
                                    step={1}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    <LoadingSwap isLoading={isSubmitting}>Update Profile</LoadingSwap>
                </Button>
            </form>
        </Form>
    );
}
