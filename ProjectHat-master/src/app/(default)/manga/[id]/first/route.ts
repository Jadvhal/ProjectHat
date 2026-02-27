import { client, serverHeaders } from "@/lib/api";
import { permanentRedirect, redirect } from "next/navigation";
import { type NextRequest } from "next/server";

async function getMangaChapters(id: string) {
    const { data, error } = await client.GET("/v2/manga/{id}/chapters", {
        params: {
            path: {
                id,
            },
        },
        headers: serverHeaders,
    });

    return { data, error };
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split("/").at(-2);
    if (!id) {
        redirect(`/`);
    }

    const { data, error } = await getMangaChapters(id);
    if (error || !data) {
        throw new Error("Failed to fetch chapters");
    }

    const chapters = data.data;
    if (chapters.length === 0) {
        throw new Error("No chapters found");
    }

    const firstChapter = chapters[chapters.length - 1].number;
    permanentRedirect(`/manga/${id}/${firstChapter}`);
}
