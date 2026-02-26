"use client";

import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GRID_CLASS } from "../grid-page";
import MangaCardSkeleton from "../manga/manga-card-skeleton";
import { MangaGrid } from "../manga/manga-grid";
import ClientPagination from "../ui/pagination/client-pagination";
import { useRouter } from "next/navigation";

export function HomeLatestClient() {
    const { data, isLoading } = useQuery({
        queryKey: ["latest-home"],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/manga/list", {
                params: {
                    query: {
                        page: 1,
                        pageSize: 24,
                    },
                },
            });

            if (error || !data) {
                throw new Error("Failed to fetch latest manga");
            }

            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className={GRID_CLASS}>
                {Array.from({ length: 24 }).map((_, i) => (
                    <MangaCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!data) return null;

    return (
        <>
            <MangaGrid mangaList={data.items} />
            {data.totalPages > 1 && (
                <LatestPagination totalPages={data.totalPages} />
            )}
        </>
    );
}

function LatestPagination({ totalPages }: { totalPages: number }) {
    const router = useRouter();
    return (
        <ClientPagination
            currentPage={1}
            totalPages={totalPages}
            handlePageChange={(page) => router.push(`/latest/${page}`)}
            className="mt-4"
        />
    );
}
