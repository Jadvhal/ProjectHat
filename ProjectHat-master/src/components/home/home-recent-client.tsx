"use client";

import { GRID_CLASS } from "@/components/grid-page";
import { MangaCard } from "@/components/manga/manga-card";
import MangaCardSkeleton from "@/components/manga/manga-card-skeleton";
import { client } from "@/lib/api";
import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";

export function HomeRecentClient() {
    const { user, isLoading: isUserLoading } = useUser();

    const { data, isLoading } = useQuery({
        queryKey: ["viewed-manga"],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/manga/viewed", {
                params: {
                    query: {
                        limit: 8,
                    },
                },
            });

            if (error || !data) {
                throw new Error("Failed to fetch viewed manga");
            }

            return data.data;
        },
        enabled: !!user,
        staleTime: 2 * 60 * 1000,
    });

    // Don't render anything if user is not logged in
    if (!isUserLoading && !user) {
        return null;
    }

    // Show skeleton while loading
    if (isLoading || isUserLoading) {
        return (
            <>
                <h2 className="text-3xl font-bold mb-2">Recently Viewed</h2>
                <div className={GRID_CLASS}>
                    {[...Array(8)].map((_, index) => (
                        <MangaCardSkeleton
                            key={`recent-skeleton-${index}`}
                            className={
                                index > 5
                                    ? "block sm:hidden lg:block 2xl:hidden"
                                    : ""
                            }
                        />
                    ))}
                </div>
            </>
        );
    }

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-2">Recently Viewed</h2>
            <div className={GRID_CLASS}>
                {data.map((manga, index) => (
                    <MangaCard
                        key={manga.id}
                        manga={manga}
                        className={
                            index > 5
                                ? "block sm:hidden lg:block 2xl:hidden"
                                : ""
                        }
                    />
                ))}
            </div>
        </>
    );
}
