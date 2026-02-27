"use client";

import { publicClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GRID_CLASS } from "@/components/grid-page";
import MangaCardSkeleton from "@/components/manga/manga-card-skeleton";
import { MangaGrid } from "@/components/manga/manga-grid";
import ClientPagination from "@/components/ui/pagination/client-pagination";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LatestPageClientProps {
    initialPage?: number;
}

export function LatestPageClient({
    initialPage = 1,
}: LatestPageClientProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(initialPage);

    const { data, isLoading, error } = useQuery({
        queryKey: ["latest", currentPage],
        queryFn: async () => {
            const { data, error } = await publicClient.GET("/v2/manga/list", {
                params: {
                    query: {
                        page: currentPage,
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

    if (error || !data) {
        return <div className="text-center py-8 text-muted-foreground">Failed to load latest releases. Please try again later.</div>;
    }

    return (
        <>
            <MangaGrid mangaList={data.items} />
            <ClientPagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                handlePageChange={(page) => {
                    setCurrentPage(page);
                    if (page > 1) {
                        router.push(`/latest/${page}`);
                    } else {
                        router.push("/latest");
                    }
                }}
                className="mt-4"
            />
        </>
    );
}
