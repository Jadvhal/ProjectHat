"use client";

import { publicClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { MangaCommentList } from "./manga-comment-list";

export type CommentTarget = "manga" | "chapter";

export function MangaCommentsClient({
    mangaId,
    target,
}: {
    mangaId: string;
    target: CommentTarget;
}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["comments", mangaId],
        queryFn: async () => {
            const { data, error } = await publicClient.GET(
                "/v2/comments/{id}",
                {
                    params: {
                        path: { id: mangaId },
                        query: {
                            page: 1,
                            pageSize: 20,
                            sort: "Upvoted",
                        },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch comments");
            }

            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-2 pb-2 border-b">
                    Comments
                </h2>
                <div className="text-center py-12">
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-48 mx-auto mb-2" />
                        <div className="h-4 bg-muted rounded w-32 mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-2 pb-2 border-b">
                    Comments
                </h2>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        Failed to load comments. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    const commentsWithReplies: components["schemas"]["CommentWithRepliesResponse"][] =
        (data.items || []).map((comment) => ({
            ...comment,
            replies: [],
        }));

    return (
        <MangaCommentList
            initialComments={commentsWithReplies}
            mangaId={mangaId}
            totalPages={data.totalPages}
            target={target}
        />
    );
}
