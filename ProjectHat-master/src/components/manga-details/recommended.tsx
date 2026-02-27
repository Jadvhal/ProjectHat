"use client";

import { publicClient } from "@/lib/api";
import { GRID_CLASS } from "../grid-page";
import MangaCardSkeleton from "../manga/manga-card-skeleton";
import { useQuery } from "@tanstack/react-query";
import { MangaGrid } from "../manga/manga-grid";

export function MangaRecommendationsClient({ id }: { id: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["manga-recommendations", id],
        queryFn: async () => {
            const { data, error } = await publicClient.GET(
                "/v2/manga/{id}/recommendations",
                {
                    params: {
                        path: { id },
                        query: { limit: 12 },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch recommendations");
            }

            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className={GRID_CLASS}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <MangaCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error || !data || data.length === 0) {
        return <div className="text-center py-8">No recommendations found</div>;
    }

    return <MangaGrid mangaList={data} />;
}
