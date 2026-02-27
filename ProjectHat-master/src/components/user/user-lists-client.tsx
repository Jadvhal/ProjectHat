"use client";

import { publicClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { UserLists } from "./user-lists";
import { UserListsSkeleton } from "./user-lists-skeleton";

export function UserListsClient({ userId }: { userId: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["user-lists-init", userId],
        queryFn: async () => {
            const { data, error } = await publicClient.GET(
                "/v2/lists/user/{userId}",
                {
                    params: {
                        path: { userId },
                        query: {
                            page: 1,
                            pageSize: 12,
                        },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch user lists");
            }

            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <UserListsSkeleton />;
    }

    if (error || !data) {
        return (
            <div className="text-center text-muted-foreground py-4">
                Failed to load user lists.
            </div>
        );
    }

    return <UserLists userId={userId} initialData={data} />;
}
