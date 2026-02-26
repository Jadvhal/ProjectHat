"use client";

import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GRID_CLASS } from "@/components/grid-page";
import MangaCardSkeleton from "@/components/manga/manga-card-skeleton";
import { MangaGrid } from "@/components/manga/manga-grid";
import ClientPagination from "@/components/ui/pagination/client-pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ErrorPage from "@/components/error-page";

interface PopularPageClientProps {
    initialPage?: number;
    initialDays?: number;
}

export function PopularPageClient({
    initialPage = 1,
    initialDays = 30,
}: PopularPageClientProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [days] = useState(initialDays);

    const { data, isLoading, error } = useQuery({
        queryKey: ["popular", currentPage, days],
        queryFn: async () => {
            const { data, error } = await client.GET(
                "/v2/manga/list/popular",
                {
                    params: {
                        query: {
                            page: currentPage,
                            pageSize: 24,
                            days: days,
                        },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch popular manga");
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
        return <ErrorPage error={error} />;
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
                        router.push(`/popular/${page}`);
                    } else {
                        router.push("/popular");
                    }
                }}
                className="mt-4"
            />
        </>
    );
}
