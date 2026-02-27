"use client";

import { client } from "@/lib/api";
import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ConnectedAccounts } from "./connected-accounts";
import { UserMangaLists } from "./lists";
import { UserProfile } from "./user-profile";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

function AccountBodySkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="space-y-4">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                        Your Manga Lists
                    </h2>
                    <Button variant="outline" disabled>
                        Create List
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function AccountBodyClient() {
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, isUserLoading, router]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["account-data"],
        queryFn: async () => {
            const [userRes, listsRes] = await Promise.all([
                client.GET("/v2/user/me"),
                client.GET("/v2/lists/user/me", {
                    params: {
                        query: {
                            pageSize: 100,
                        },
                    },
                }),
            ]);

            if (userRes.error) {
                throw new Error("Failed to fetch account data");
            }

            const lists = listsRes.error
                ? []
                : listsRes.data?.data?.items || [];

            return {
                user: userRes.data.data,
                lists,
            };
        },
        enabled: !!user,
        staleTime: 2 * 60 * 1000,
    });

    if (isUserLoading || isLoading) {
        return <AccountBodySkeleton />;
    }

    if (!user) {
        return null; // Will redirect
    }

    if (error || !data) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Failed to load account data. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <UserProfile user={data.user} />
            <ConnectedAccounts />
            <UserMangaLists initialLists={data.lists} />
        </div>
    );
}
