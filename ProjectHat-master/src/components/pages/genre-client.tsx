"use client";

import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GRID_CLASS } from "@/components/grid-page";
import MangaCardSkeleton from "@/components/manga/manga-card-skeleton";
import { MangaGrid } from "@/components/manga/manga-grid";
import ClientPagination from "@/components/ui/pagination/client-pagination";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorPage from "@/components/error-page";

interface GenrePageClientProps {
    genreId: string;
    initialPage?: number;
}

export function GenrePageClient({
    genreId,
    initialPage = 1,
}: GenrePageClientProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(initialPage);
    const genreName = decodeURIComponent(genreId).replaceAll("-", " ");

    const { data, isLoading, error } = useQuery({
        queryKey: ["genre", genreId, currentPage],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/manga/list", {
                params: {
                    query: {
                        genres: [genreName],
                        page: currentPage,
                        pageSize: 24,
                        sortBy: "latest",
                    },
                },
            });

            if (error || !data) {
                throw new Error("Failed to fetch genre manga");
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
                        router.push(`/genre/${genreId}/${page}`);
                    } else {
                        router.push(`/genre/${genreId}`);
                    }
                }}
                className="mt-4"
            />
        </>
    );
}
