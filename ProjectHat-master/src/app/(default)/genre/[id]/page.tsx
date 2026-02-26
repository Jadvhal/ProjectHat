import { GenrePageClient } from "@/components/pages/genre-client";
import { STATIC_GENERATION_DISABLED } from "@/lib/api/pre-render";
import { genres } from "@/lib/api/search";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string; page?: string }>;
    searchParams: Promise<{
        sort?: string;
    }>;
}

export async function generateStaticParams() {
    if (STATIC_GENERATION_DISABLED) {
        return [{ id: genres[0] }];
    }
    return genres.map((id) => ({ id }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const name = params.id.replaceAll("-", " ");
    const description = `View all ${name} manga`;

    return createMetadata({
        title: name,
        description: description,
        image: createOgImage("genre", params.id),
        canonicalPath: `/genre/${params.id}`,
    });
}

export default async function GenrePage(props: PageProps) {
    const params = await props.params;
    const name = decodeURIComponent(params.id).replaceAll("-", " ");

    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">{name}</h2>
            </div>

            <GenrePageClient
                genreId={params.id}
                initialPage={Number(params.page) || 1}
            />
        </div>
    );
}
