"use client";

import { publicClient } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <MalRedirectClient params={params} />;
}

function MalRedirectClient({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["mal-redirect", params],
        queryFn: async () => {
            const { id } = await params;
            const { data, error } = await publicClient.GET(
                "/v2/manga/mal/{id}",
                {
                    params: {
                        path: { id: Number(id) },
                    },
                },
            );

            if (error || !data) {
                throw error || new Error("Failed to fetch");
            }

            return data.data;
        },
    });

    const router = useRouter();

    useEffect(() => {
        if (data) {
            router.replace(`/manga/${data.id}`);
        }
    }, [data, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="h-4 bg-muted rounded w-48" />
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorPage />;
    }

    return null;
}
