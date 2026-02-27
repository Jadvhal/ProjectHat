import { LatestPageClient } from "@/components/pages/latest-client";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ page?: string }>;
}

export const metadata: Metadata = createMetadata({
    title: "Latest Releases",
    description: "Read the latest manga releases for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/latest",
});

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
