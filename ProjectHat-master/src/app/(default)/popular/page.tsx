import {
    GridSortSelect,
    GridSortSelectFallback,
} from "@/components/grid/grid-sort";
import { PopularPageClient } from "@/components/pages/popular-client";
import { client, serverHeaders } from "@/lib/api";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{ page?: string }>;
    searchParams: Promise<{
        days: string;
    }>;
}

export const metadata: Metadata = createMetadata({
    title: "Akari Manga",
    description: "Read the most popular manga for free on Akari.",
    image: "/og/popular.webp",
    canonicalPath: "/popular",
});

const CACHE_TIMES: Record<
    string,
    { stale: number; revalidate: number; expire: number }
> = {
    "1": { stale: 60, revalidate: 60, expire: 120 },
    "7": { stale: 600, revalidate: 1800, expire: 3600 },
    "30": { stale: 1800, revalidate: 3600, expire: 7200 },
    "90": { stale: 3600, revalidate: 7200, expire: 14400 },
    "180": { stale: 7200, revalidate: 14400, expire: 28800 },
    "365": { stale: 14400, revalidate: 86400, expire: 604800 },
};

export const getPopularData = async (page: number, days: number = 30) => {
    "use cache";
    cacheLife(CACHE_TIMES[days.toString()]);
    cacheTag("popular");

    const { data, error } = await client.GET("/v2/manga/list/popular", {
        params: {
            query: {
                page: page,
                pageSize: 24,
                days: days,
            },
        },
        headers: serverHeaders,
    });

    return { data, error };
};

export default async function Popular(props: PageProps) {
    const { page } = await props.params;
    const { days } = await props.searchParams;

    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">Popular</h2>
            </div>

            <PopularPageClient
                initialPage={Number(page) || 1}
                initialDays={Number(days) || 30}
            />
        </div>
    );
}
