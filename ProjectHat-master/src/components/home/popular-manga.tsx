"use client";

import { handleImageError } from "@/lib/image-fallback";
import { cn, generateSizes } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    useCarousel,
} from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";

const AUTOPLAY_INTERVAL = 6000;

interface PopularMangaProps {
    manga: components["schemas"]["MangaResponse"][];
}

export function PopularManga({ manga }: PopularMangaProps) {
    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
        >
            <CarouselContent>
                {manga.map((mangaItem, index) => (
                    <CarouselItem
                        key={mangaItem.id}
                        className="pl-4 pr-[1px] basis-1/2 sm:basis-full 2xl:basis-1/2"
                    >
                        <PopularMangaCard
                            manga={mangaItem}
                            priority={index < 2}
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselControls />
        </Carousel>
    );
}

function CarouselControls() {
    const { scrollNext, canScrollNext, scrollPrev, canScrollPrev, api } =
        useCarousel();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(
        null,
    );
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrentPage(api.selectedScrollSnap() + 1);
            setTotalPages(api.scrollSnapList().length);
        };

        onSelect();
        api.on("select", onSelect);

        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    const resetProgress = useCallback(() => {
        setProgress(0);
        startTimeRef.current = performance.now();
    }, []);

    const startAutoplay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (progressRef.current) cancelAnimationFrame(progressRef.current);

        resetProgress();

        // Animate progress bar
        const animateProgress = (now: number) => {
            const elapsed = now - startTimeRef.current;
            const pct = Math.min(elapsed / AUTOPLAY_INTERVAL, 1);
            setProgress(pct);
            if (pct < 1) {
                progressRef.current = requestAnimationFrame(animateProgress);
            }
        };
        progressRef.current = requestAnimationFrame(animateProgress);

        // Auto-advance
        timerRef.current = setInterval(() => {
            api?.scrollNext();
            resetProgress();
            // Restart progress animation
            const animateAgain = (now: number) => {
                const elapsed = now - startTimeRef.current;
                const pct = Math.min(elapsed / AUTOPLAY_INTERVAL, 1);
                setProgress(pct);
                if (pct < 1) {
                    progressRef.current =
                        requestAnimationFrame(animateAgain);
                }
            };
            if (progressRef.current)
                cancelAnimationFrame(progressRef.current);
            progressRef.current = requestAnimationFrame(animateAgain);
        }, AUTOPLAY_INTERVAL);
    }, [api, resetProgress]);

    const stopAutoplay = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (progressRef.current) {
            cancelAnimationFrame(progressRef.current);
            progressRef.current = null;
        }
    }, []);

    // Start autoplay on mount, pause on hover
    useEffect(() => {
        if (!api) return;
        if (!isPaused) {
            startAutoplay();
        } else {
            stopAutoplay();
        }
        return () => stopAutoplay();
    }, [api, isPaused, startAutoplay, stopAutoplay]);

    // Reset timer on manual interaction
    const handlePrev = useCallback(() => {
        scrollPrev();
        resetProgress();
        if (!isPaused) {
            stopAutoplay();
            startAutoplay();
        }
    }, [scrollPrev, resetProgress, isPaused, stopAutoplay, startAutoplay]);

    const handleNext = useCallback(() => {
        scrollNext();
        resetProgress();
        if (!isPaused) {
            stopAutoplay();
            startAutoplay();
        }
    }, [scrollNext, resetProgress, isPaused, stopAutoplay, startAutoplay]);

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Progress bar */}
            <div className="relative w-full h-1 bg-muted rounded-full mt-3 overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-none"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
            <div className="flex items-center gap-2 pt-2 w-full justify-between sm:p-0 sm:pt-2 sm:w-auto sm:absolute sm:bottom-2 sm:right-2">
                <span className="order-2 sm:order-1 text-sm text-muted-foreground">
                    {currentPage} / {totalPages}
                </span>
                <Button
                    aria-label="Previous slide"
                    size="icon"
                    className="order-1 sm:order-2"
                    disabled={!canScrollPrev}
                    onClick={handlePrev}
                >
                    <ArrowLeft />
                </Button>
                <Button
                    aria-label="Next slide"
                    size="icon"
                    className="order-3"
                    disabled={!canScrollNext}
                    onClick={handleNext}
                >
                    <ArrowRight />
                </Button>
            </div>
        </div>
    );
}

function PopularMangaCardInfo({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="line-clamp-1 text-lg text-foreground">{value}</p>
        </div>
    );
}

interface PopularMangaCardProps {
    manga: components["schemas"]["MangaResponse"];
    priority?: boolean;
}

function PopularMangaCard({ manga, priority }: PopularMangaCardProps) {
    return (
        <Link
            href={`/manga/${manga.id}`}
            className="flex flex-row h-full w-full rounded-lg border bg-card"
        >
            <Image
                src={manga.cover}
                alt={manga.title}
                className="h-auto w-full sm:w-64 object-cover rounded-l-lg rounded-r-lg sm:rounded-r-none"
                width={200}
                height={300}
                quality={40}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                preload={priority}
                decoding="async"
                onError={handleImageError}
                sizes={generateSizes({
                    default: "240px",
                })}
            />
            <div className="space-y-2 py-2 px-4 w-full hidden sm:block">
                <h2 className="line-clamp-2 text-3xl font-semibold leading-tight text-card-foreground border-b pb-1">
                    {manga.title}
                </h2>

                <PopularMangaCardInfo
                    label="Author"
                    value={manga.authors.join(", ")}
                />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                        <p className="line-clamp-1 text-lg text-foreground">{manga.status}</p>
                        {Date.now() - new Date(manga.updatedAt).getTime() < 24 * 60 * 60 * 1000 && (
                            <span className="badge-new inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                                New Chapter
                            </span>
                        )}
                    </div>
                </div>
                <PopularMangaCardInfo label="Type" value={manga.type} />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        Genres
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {manga.genres.slice(0, 6).map((genre) => (
                            <Badge variant="secondary" key={genre}>
                                {genre}
                            </Badge>
                        ))}
                        {manga.genres.length > 6 && (
                            <Badge variant="secondary">
                                +{manga.genres.length - 6}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function PopularMangaSkeleton() {
    return (
        <div className="w-full grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <PopularMangaSkeletonCard />
            <PopularMangaSkeletonCard className="hidden 2xl:block" />
        </div>
    );
}

function PopularMangaSkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("w-full", className)}>
            <div className="overflow-hidden">
                <div className="flex">
                    <div className="min-w-0 flex-shrink-0 flex-grow-0 pr-[1px] basis-full">
                        <div className="flex flex-row h-full w-full rounded-lg border bg-card">
                            <Skeleton className="aspect-[2/3] sm:h-[384px] w-full sm:w-64 rounded-l-lg rounded-r-lg sm:rounded-r-none" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 pt-2 w-full justify-between sm:p-0 sm:w-auto sm:absolute sm:bottom-2 sm:right-2">
                <Skeleton className="order-2 sm:order-1 h-5 w-12" />
                <Skeleton className="order-1 sm:order-2 h-10 w-10" />
                <Skeleton className="order-3 h-10 w-10" />
            </div>
        </div>
    );
}
