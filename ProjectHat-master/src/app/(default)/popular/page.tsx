import { PopularPageClient } from "@/components/pages/popular-client";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";

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
