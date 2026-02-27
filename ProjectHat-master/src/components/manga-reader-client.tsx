"use client";

import { publicClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "./error-page";
import { Reader } from "./manga-reader";

function ReaderSkeleton() {
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full" />
                <div className="h-4 bg-muted rounded w-48" />
                <div className="h-3 bg-muted rounded w-32" />
            </div>
        </div>
    );
}

export function ReaderClient({
    mangaId,
    subId,
}: {
    mangaId: string;
    subId: string;
}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["chapter", mangaId, subId],
        queryFn: async () => {
            const { data, error } = await publicClient.GET(
                "/v2/manga/{id}/{subId}",
                {
                    params: {
                        path: {
                            id: mangaId,
                            subId: Number(subId),
                        },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch chapter");
            }

            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <ReaderSkeleton />;
    }

    if (error || !data) {
        return <ErrorPage />;
    }

    return <Reader chapter={data} />;
}
