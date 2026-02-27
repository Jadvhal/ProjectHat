import { GRID_CLASS } from "@/components/grid-page";
import { HomeLatestClient } from "@/components/home/home-latest-client";
import { HomePopularClient } from "@/components/home/home-popular-client";
import { HomeRecentClient } from "@/components/home/home-recent-client";
import { InstallPrompt } from "@/components/home/install-prompt";
import { NotificationPrompt } from "@/components/home/notification-prompt";
import { PromptStack } from "@/components/ui/prompt-stack";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";

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

                <HomeRecentClient />

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
