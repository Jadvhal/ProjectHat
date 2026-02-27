import { ReaderClient } from "@/components/manga-reader-client";
import { MangaCommentsClient } from "@/components/manga-details/manga-comments-client";
import { client, serverHeaders } from "@/lib/api";
import {
    getAllChapterIds,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";

const getChapter = async (id: string, subId: number) => {
    const { data, error } = await client.GET("/v2/manga/{id}/{subId}", {
        params: {
            path: {
                id: id,
                subId: subId,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data: data.data, error: null };
};

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateStaticParams() {
    const limit = 1;

    const mangaIds = await getAllChapterIds(limit);
    if (!mangaIds || mangaIds.length === 0) {
        return [];
    }

    if (STATIC_GENERATION_DISABLED) {
        return [
            {
                id: mangaIds[0].mangaId,
                subId: mangaIds[0].chapterIds[0].toString(),
            },
        ];
    }

    return mangaIds.flatMap(({ mangaId, chapterIds }) =>
        chapterIds.map((chapterId) => ({
            id: mangaId,
            subId: chapterId.toString(),
        })),
    );
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    const mangaParams = await params;
    const { data, error } = await getChapter(
        mangaParams.id,
        Number(mangaParams.subId),
    );

    if (error) {
        return {
            title: "Chapter Not Found",
            description: "The requested chapter could not be found.",
        };
    }

    const chapter = data;
    const title = `${chapter.mangaTitle} - ${chapter.title}`;
    const description = `Read ${chapter.mangaTitle} ${chapter.title}.`;

    return createMetadata({
        title: title,
        description: description,
        image: createOgImage("manga", chapter.mangaId),
        canonicalPath: `/manga/${mangaParams.id}`,
    });
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    const mangaParams = await params;

    return (
        <div className="bg-background text-foreground">
            <ReaderClient mangaId={mangaParams.id} subId={mangaParams.subId} />
            <div className="p-4">
                <MangaCommentsClient
                    mangaId={mangaParams.id}
                    target="chapter"
                />
            </div>
        </div>
    );
}
