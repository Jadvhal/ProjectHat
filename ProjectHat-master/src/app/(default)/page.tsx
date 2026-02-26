import { GRID_CLASS } from "@/components/grid-page";
import { HomeLatestClient } from "@/components/home/home-latest-client";
import { HomePopularClient } from "@/components/home/home-popular-client";
import { InstallPrompt } from "@/components/home/install-prompt";
import { NotificationPrompt } from "@/components/home/notification-prompt";
import { MangaCard } from "@/components/manga/manga-card";
import MangaCardSkeleton from "@/components/manga/manga-card-skeleton";
import { PromptStack } from "@/components/ui/prompt-stack";
import { client, serverHeaders } from "@/lib/api";
import { getAuthToken } from "@/lib/auth/server";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";

export const metadata: Metadata = createMetadata({
    title: "MangaHat - The Land of Manga and Manhwa",
    description: "Read manga and manhwa for free on MangaHat.",
    image: "/og/akari.webp",
    canonicalPath: "/",
});

export default async function Home() {
    return (
        <>
            <div className="flex-1 px-4 pt-2 pb-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Popular Manga</h2>
                    <HomePopularClient />
                </div>

                <Suspense
                    fallback={
                        <>
                            <h2 className="text-3xl font-bold mb-2">
                                Recently Viewed
                            </h2>
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
                    }
                >
                    <HomeRecent />
                </Suspense>

                <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
                <HomeLatestClient />
            </div>
            <PromptStack>
                <InstallPrompt />
                <NotificationPrompt />
            </PromptStack>
        </>
    );
}

async function getViewedManga(token: string) {
    "use cache";
    cacheLife("minutes");

    const { data, error } = await client.GET("/v2/manga/viewed", {
        params: {
            query: {
                limit: 8,
            },
        },
        headers: {
            ...serverHeaders,
            Authorization: `Bearer ${token}`,
        },
    });

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}

async function HomeRecent() {
    const token = await getAuthToken();
    if (!token) {
        return null;
    }

    const { data, error } = await getViewedManga(token);
    if (error || !data || data.data.length === 0) {
        return null;
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-2">Recently Viewed</h2>
            <div className={GRID_CLASS}>
                {data.data.map((manga, index) => (
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
