import { LatestPageClient } from "@/components/pages/latest-client";
import { client, serverHeaders } from "@/lib/api";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

interface PageProps {
    params: Promise<{ page?: string }>;
}

export const metadata: Metadata = createMetadata({
    title: "Latest Releases",
    description: "Read the latest manga releases for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/latest",
});

export const getLatestData = async (currentPage: number) => {
    "use cache";
    cacheLife("minutes");
    cacheTag("latest");

    const { data, error } = await client.GET("/v2/manga/list", {
        params: {
            query: {
                page: currentPage,
                pageSize: 24,
            },
        },
        headers: serverHeaders,
    });

    return { data, error };
};

export default async function Latest(props: PageProps) {
    const { page } = await props.params;

    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
            </div>

            <LatestPageClient initialPage={Number(page) || 1} />
        </div>
    );
}
