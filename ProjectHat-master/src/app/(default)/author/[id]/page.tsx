import { AuthorPageClient } from "@/components/pages/author-client";
import {
    getAllAuthors,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";

export interface AuthorPageProps {
    params: Promise<{ id: string; page?: string }>;
}

export async function generateStaticParams() {
    let limit = undefined;
    if (STATIC_GENERATION_DISABLED) {
        limit = 1;
    }

    const authorIds = await getAllAuthors(limit);
    if (!authorIds || authorIds.length === 0) {
        return [];
    }

    if (STATIC_GENERATION_DISABLED) {
        return [{ id: authorIds[0] }];
    }

    return authorIds.map((id) => ({ id }));
}

export async function generateMetadata(
    props: AuthorPageProps,
): Promise<Metadata> {
    const params = await props.params;
    const name = params.id.replaceAll("-", " ");
    const description = `View all manga by ${name} on Akari for free.`;

    return createMetadata({
        title: name,
        description: description,
        image: createOgImage("author", params.id),
        canonicalPath: `/author/${params.id}`,
    });
}

export default async function AuthorPage(props: AuthorPageProps) {
    const { id, page } = await props.params;
    const title = decodeURIComponent(id).replaceAll("-", " ");

    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
            </div>

            <AuthorPageClient
                authorId={id}
                initialPage={Number(page) || 1}
            />
        </div>
    );
}
