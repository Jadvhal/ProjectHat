"use client";

import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { PopularManga, PopularMangaSkeleton } from "./popular-manga";

export function HomePopularClient() {
    const { data, isLoading } = useQuery({
        queryKey: ["popular-home"],
        queryFn: async () => {
            const { data, error } = await client.GET(
                "/v2/manga/list/popular",
                {
                    params: {
                        query: {
                            page: 1,
                            pageSize: 24,
                            days: 7,
                        },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch popular manga");
            }

            return data.data.items;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <PopularMangaSkeleton />;
    if (!data) return null;

    return <PopularManga manga={data} />;
}
