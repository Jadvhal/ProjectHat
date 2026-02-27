"use client";

import { publicClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ChaptersSection } from "./chapters-client";

function ChaptersSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="flex justify-end mb-2">
                <div className="flex gap-2">
                    <div className="h-10 w-40 bg-muted rounded" />
                    <div className="h-10 w-40 bg-muted rounded" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg" />
                ))}
            </div>
        </div>
    );
}

export function ChaptersSectionClient({ id }: { id: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["manga-chapters", id],
        queryFn: async () => {
            const { data, error } = await publicClient.GET(
                "/v2/manga/{id}/chapters",
                {
                    params: {
                        path: { id },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch chapters");
            }

            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <ChaptersSkeleton />;
    }

    if (error || !data) {
        return <div className="text-center py-8">Failed to load chapters</div>;
    }

    return <ChaptersSection mangaId={id} chapters={data} />;
}
