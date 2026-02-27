"use client";

import { publicClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GRID_CLASS } from "@/components/grid-page";
import MangaCardSkeleton from "@/components/manga/manga-card-skeleton";
import { MangaGrid } from "@/components/manga/manga-grid";
import ClientPagination from "@/components/ui/pagination/client-pagination";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorPage from "@/components/error-page";

interface AuthorPageClientProps {
    authorId: string;
    initialPage?: number;
}

export function AuthorPageClient({
    authorId,
    initialPage = 1,
}: AuthorPageClientProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(initialPage);
    const authorName = decodeURIComponent(authorId).replaceAll("-", " ");

    const { data, isLoading, error } = useQuery({
        queryKey: ["author", authorId, currentPage],
        queryFn: async () => {
            const { data, error } = await publicClient.GET("/v2/author/{name}", {
                params: {
                    path: {
                        name: authorName,
                    },
                    query: {
                        page: currentPage,
                        pageSize: 24,
                    },
                },
            });

            if (error || !data) {
                throw new Error("Failed to fetch author manga");
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
                        router.push(`/author/${authorId}/${page}`);
                    } else {
                        router.push(`/author/${authorId}`);
                    }
                }}
                className="mt-4"
            />
        </>
    );
}
