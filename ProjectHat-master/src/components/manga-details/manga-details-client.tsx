"use client";

import { Badge, BadgeVariantProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { publicClient } from "@/lib/api";
import { generateSizes, pluralize } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { handleImageError } from "@/lib/image-fallback";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbSetter } from "../breadcrumb-setter";
import Buttons from "./buttons";
import ScoreDisplay from "./score";
import {
    MangaUpdatedAt,
    MangaUpdatedAtFallback,
} from "./updated-at";
import { ViewManga } from "./view-manga";
import EnhancedImage from "../ui/enhanced-image";

import AniImage from "@/public/img/icons/AniList-logo.webp";
import MalImage from "@/public/img/icons/MAL-logo.webp";
import { Suspense } from "react";

const getStatusVariant = (status: string): BadgeVariantProps["variant"] => {
    switch (status.toLowerCase()) {
        case "ongoing":
            return "positive";
        case "completed":
            return "info";
        case "hiatus":
            return "warning";
        default:
            return "default";
    }
};

const getViewsColor = (views: number) => {
    if (views < 100)
        return { bg: "bg-[#ffc659] hover:bg-[#ffc659]", text: "text-black" };
    else if (views < 1_000)
        return { bg: "bg-[#ff8f70] hover:bg-[#ff8f70]", text: "text-black" };
    else if (views < 10_000)
        return { bg: "bg-[#ff609e] hover:bg-[#ff609e]", text: "text-white" };
    else if (views < 100_000)
        return { bg: "bg-[#e255d0] hover:bg-[#e255d0]", text: "text-white" };

    return {
        bg: "bg-accent-positive hover:bg-accent-positive",
        text: "text-white",
    };
};

function ExternalLinks({
    manga,
}: {
    manga: components["schemas"]["MangaResponse"];
}) {
    return (
        <>
            {manga.aniId && (
                <Link
                    href={`https://anilist.co/manga/${manga.aniId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                    prefetch={false}
                >
                    <Image
                        src={AniImage}
                        alt="AniList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                        width={40}
                        height={40}
                    />
                </Link>
            )}
            {manga.malId && (
                <Link
                    href={`https://myanimelist.net/manga/${manga.malId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                    prefetch={false}
                >
                    <Image
                        src={MalImage}
                        alt="MyAnimeList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                        width={40}
                        height={40}
                    />
                </Link>
            )}
        </>
    );
}

function MangaDetailsSkeleton() {
    return (
        <div className="mx-auto p-4 animate-pulse">
            <div className="flex flex-col justify-center gap-4 lg:flex-row mb-2 items-stretch h-auto">
                <div className="flex-shrink-0 hidden lg:block">
                    <div className="rounded-lg bg-muted h-[600px] w-[400px]" />
                </div>
                <div className="flex flex-col justify-between flex-grow lg:max-h-[600px] gap-0">
                    <div className="flex items-center mb-4 border-b pb-4 justify-between">
                        <div className="h-8 bg-muted rounded w-64" />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 flex-grow overflow-hidden">
                        <div className="lg:w-1/2 flex flex-col gap-4">
                            <div className="h-6 bg-muted rounded w-32" />
                            <div className="h-6 bg-muted rounded w-24" />
                            <div className="h-6 bg-muted rounded w-40" />
                        </div>
                        <div className="lg:w-1/2">
                            <div className="h-48 bg-muted rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MangaDetailsClient({ id }: { id: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["manga-details", id],
        queryFn: async () => {
            const { data, error } = await publicClient.GET("/v2/manga/{id}", {
                params: {
                    path: { id },
                },
            });

            if (error || !data) {
                throw new Error("Failed to fetch manga details");
            }

            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <MangaDetailsSkeleton />;
    }

    if (error || !data) {
        return (
            <div className="mx-auto p-4">
                <p className="text-center text-muted-foreground">
                    Failed to load manga details. Please try again later.
                </p>
            </div>
        );
    }

    const manga = data;
    return (
        <>
            <BreadcrumbSetter orig={manga.id} title={manga.title} />
            <div className="flex flex-col justify-center gap-4 lg:flex-row mb-2 items-stretch h-auto">
                {/* Image and Details Section */}
                <div className="flex flex-shrink-0 justify-center hidden lg:block">
                    <EnhancedImage
                        src={manga.cover}
                        alt={manga.title}
                        className="rounded-lg object-cover h-auto max-w-lg min-w-full w-full lg:h-[600px]"
                        hoverEffect="dynamic-tilt"
                        width={400}
                        height={600}
                        preload={true}
                        fetchPriority="high"
                        quality={60}
                        sizes={generateSizes({
                            sm: "128px",
                            lg: "400px",
                        })}
                    />
                </div>

                {/* Card with flex layout to lock title and buttons */}
                <div className="flex flex-col justify-between flex-grow lg:max-h-[600px] bg-background gap-0">
                    {/* Title stays at the top */}
                    <div className="flex items-center mb-4 border-b pb-4 justify-between">
                        <Image
                            src={manga.cover}
                            alt={manga.title}
                            className="rounded-lg object-cover h-auto w-24 sm:w-30 md:w-40 lg:hidden mr-4"
                            width={400}
                            height={600}
                            preload={true}
                            fetchPriority="high"
                            quality={60}
                            onError={handleImageError}
                            sizes={generateSizes({
                                sm: "128px",
                                lg: "400px",
                            })}
                        />
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold lg:max-h-27 overflow-y-auto">
                                {manga.title}
                            </h1>
                            {manga.alternativeTitles &&
                                manga.alternativeTitles.length > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger className="hidden lg:block">
                                            <InfoIcon className="w-5 h-5" />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <div className="flex flex-col gap-1 max-w-96 w-auto">
                                                {manga.alternativeTitles.map(
                                                    (
                                                        mangaName: string,
                                                        index: number,
                                                    ) => (
                                                        <p
                                                            className="max-w-xs px-1 border-b border-background pb-1 last:border-b-0"
                                                            key={index}
                                                        >
                                                            {mangaName}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                        </div>
                        <div
                            className={
                                "flex-shrink-0 flex-col gap-2 flex lg:gap-0 lg:flex-row"
                            }
                        >
                            <ExternalLinks manga={manga} />
                        </div>
                    </div>

                    {/* Middle section grows as needed */}
                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 flex-grow overflow-hidden">
                        {/* Left section for the manga details */}
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                <div>
                                    <div className="text-lg font-semibold">
                                        {pluralize(
                                            "Author",
                                            manga.authors.length,
                                        )}
                                        :
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {manga.authors.map(
                                            (author: string, index: number) => (
                                                <Link
                                                    href={`/author/${encodeURIComponent(
                                                        author.replaceAll(
                                                            " ",
                                                            "-",
                                                        ),
                                                    )}`}
                                                    key={index}
                                                    prefetch={false}
                                                >
                                                    <Badge
                                                        withShadow={true}
                                                        className="bg-primary text-secondary hover:bg-gray-300 hover:text-primary dark:hover:text-secondary"
                                                        shadowClassName="mt-[4px]"
                                                    >
                                                        {author}
                                                    </Badge>
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Status:
                                    </div>
                                    <Badge
                                        variant={getStatusVariant(manga.status)}
                                    >
                                        {manga.status.charAt(0).toUpperCase() +
                                            manga.status.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Updated:
                                    </div>
                                    <Suspense
                                        fallback={<MangaUpdatedAtFallback />}
                                    >
                                        <MangaUpdatedAt
                                            updatedAt={manga.updatedAt}
                                        />
                                    </Suspense>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Views:
                                    </div>
                                    <Badge
                                        className={`${getViewsColor(manga.views).bg
                                            } ${getViewsColor(manga.views).text}`}
                                    >
                                        {manga.views}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="h-fit">
                                    <h2 className="text-xl font-semibold">
                                        Genres:
                                    </h2>
                                    <div className="flex flex-wrap gap-2 overflow-y-visible md:max-h-24 lg:overflow-y-auto xl:overflow-y-visible xl:max-h-96">
                                        {manga.genres.map((genre: string) => (
                                            <Link
                                                key={genre}
                                                href={`/genre/${encodeURIComponent(
                                                    genre.replaceAll(" ", "-"),
                                                )}`}
                                                prefetch={false}
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    withShadow={true}
                                                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                                                    shadowClassName="mt-[3px]"
                                                >
                                                    {genre}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="my-2 flex-grow">
                                    <ScoreDisplay
                                        mangaId={manga.id}
                                        score={manga.score / 2}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-auto">
                                <Buttons manga={manga} />
                            </div>
                        </div>
                        {/* Right section for the description */}
                        <div className="lg:w-1/2 flex-grow h-full flex flex-col">
                            <Card
                                className="w-full h-full max-h-60 md:max-h-96 lg:max-h-none p-4 overflow-y-auto"
                                aria-label="Description"
                                role="region"
                                data-scrollbar-custom
                            >
                                <p>{manga.description}</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <ViewManga mangaId={manga.id} />
        </>
    );
}
