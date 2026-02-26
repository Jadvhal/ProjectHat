"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { inPreview } from "@/config";
import { useBorderColor } from "@/contexts/border-color-context";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useUser } from "@/contexts/user-context";
import { setSetting, useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import SearchBar from "./search/search-bar";

interface HeaderProps {
    notification: string;
}

export function DesktopHeader({ notification }: HeaderProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const { overrides } = useBreadcrumb();
    const { borderClass } = useBorderColor();
    const [segments, setSegments] = useState<string[]>([]);
    const [originalSegments, setOriginalSegments] = useState<string[]>([]);
    const { state: sidebarState } = useSidebar();
    const themeSetting = useSetting("theme");
    const isSidebarCollapsed = useMemo(
        () => sidebarState === "collapsed",
        [sidebarState],
    );

    const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            str,
        );

    useEffect(() => {
        const pathSegments = pathname.split("/").filter(Boolean);
        if (pathSegments.length === 0) {
            pathSegments.push("manga");
        }

        const hasUnresolvedUUID = pathSegments.some(
            (segment) => isUUID(segment) && !overrides[segment],
        );
        if (hasUnresolvedUUID) {
            return;
        }

        const modifiedSegments = pathSegments.map(
            (segment) => overrides[segment] || segment,
        );
        queueMicrotask(() => {
            setOriginalSegments(pathSegments);
            setSegments(modifiedSegments);
        });
    }, [pathname, overrides]);

    const getSegmentDisplayName = (
        segment: string,
        index: number,
        segments: string[],
        maxLength: number = 35,
    ) => {
        segment = segment.replace(/-s-/g, "'s ");
        segment = segment.replace(/-/g, " ");

        const capitalizedSegment =
            segment.charAt(0).toUpperCase() + segment.slice(1);

        return capitalizedSegment.length > maxLength
            ? `${capitalizedSegment.substring(0, maxLength)}...`
            : capitalizedSegment;
    };

    const isDark = themeSetting === "dark" ||
        (themeSetting === "system" &&
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    const toggleTheme = () => {
        setSetting("theme", isDark ? "light" : "dark");
    };

    return (
        <>
            <style jsx global>{`
                /* ===== MangaHat Logo — After Effects-style Animations ===== */

                /* --- Entrance: Hat icon elastic slide from left --- */
                @keyframes mh-hat-enter {
                    0% {
                        opacity: 0;
                        transform: translateX(-40px) scale(0.5) rotate(-20deg);
                    }
                    50% {
                        opacity: 1;
                        transform: translateX(6px) scale(1.15) rotate(4deg);
                    }
                    70% {
                        transform: translateX(-3px) scale(0.97) rotate(-2deg);
                    }
                    85% {
                        transform: translateX(1px) scale(1.02) rotate(1deg);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0) scale(1) rotate(0deg);
                    }
                }

                /* --- Entrance: "Manga" text slide up with fade --- */
                @keyframes mh-manga-enter {
                    0% {
                        opacity: 0;
                        transform: translateY(18px) scale(0.8);
                        filter: blur(4px);
                    }
                    60% {
                        opacity: 1;
                        transform: translateY(-3px) scale(1.04);
                        filter: blur(0px);
                    }
                    80% {
                        transform: translateY(1px) scale(0.99);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                        filter: blur(0px);
                    }
                }

                /* --- Entrance: "Hat" cinematic slide from right + glow --- */
                @keyframes mh-hat-text-enter {
                    0% {
                        opacity: 0;
                        transform: translateX(50px) scale(0.6) rotate(8deg);
                        text-shadow: 0 0 0px transparent;
                        filter: blur(6px);
                    }
                    40% {
                        opacity: 0.8;
                        filter: blur(1px);
                    }
                    60% {
                        opacity: 1;
                        transform: translateX(-4px) scale(1.12) rotate(-1deg);
                        text-shadow: 0 0 20px rgba(139, 92, 246, 0.9),
                                     0 0 40px rgba(139, 92, 246, 0.5);
                        filter: blur(0px);
                    }
                    75% {
                        transform: translateX(2px) scale(0.97) rotate(0.5deg);
                        text-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
                    }
                    90% {
                        transform: translateX(-1px) scale(1.01);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0) scale(1) rotate(0);
                        text-shadow: 0 0 8px rgba(139, 92, 246, 0.4),
                                     0 0 16px rgba(139, 92, 246, 0.15);
                        filter: blur(0px);
                    }
                }

                /* --- Continuous: shimmer sweep on "Hat" --- */
                @keyframes mh-shimmer {
                    0% {
                        background-position: -200% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }

                /* --- Hover: hat icon wobble --- */
                @keyframes mh-hat-wobble {
                    0%   { transform: rotate(0deg) scale(1); }
                    15%  { transform: rotate(-12deg) scale(1.1); }
                    30%  { transform: rotate(10deg) scale(1.05); }
                    45%  { transform: rotate(-8deg) scale(1.08); }
                    60%  { transform: rotate(5deg) scale(1.03); }
                    75%  { transform: rotate(-3deg) scale(1.01); }
                    100% { transform: rotate(0deg) scale(1); }
                }

                /* --- Hover: "Hat" glow pulse --- */
                @keyframes mh-hat-glow-pulse {
                    0%, 100% {
                        text-shadow: 0 0 8px rgba(139, 92, 246, 0.4),
                                     0 0 16px rgba(139, 92, 246, 0.15);
                        filter: brightness(1);
                    }
                    50% {
                        text-shadow: 0 0 18px rgba(139, 92, 246, 0.9),
                                     0 0 36px rgba(139, 92, 246, 0.5),
                                     0 0 54px rgba(139, 92, 246, 0.25);
                        filter: brightness(1.2);
                    }
                }

                /* --- Logo group hover lift --- */
                .mh-logo-group {
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                                filter 0.3s ease;
                }
                .mh-logo-group:hover {
                    transform: translateY(-2px);
                    filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.25));
                }

                /* Hat icon */
                .mh-hat-icon {
                    animation: mh-hat-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    opacity: 0;
                }
                .mh-logo-group:hover .mh-hat-icon {
                    animation: mh-hat-wobble 0.6s ease-in-out;
                }

                /* "Manga" text */
                .mh-manga-text {
                    display: inline-block;
                    animation: mh-manga-enter 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
                    opacity: 0;
                }

                /* "Hat" text */
                .mh-hat-text {
                    display: inline-block;
                    animation: mh-hat-text-enter 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
                    opacity: 0;
                    color: #8B5CF6;
                    background: linear-gradient(
                        120deg,
                        #8B5CF6 0%,
                        #8B5CF6 35%,
                        #c4b5fd 48%,
                        #ede9fe 50%,
                        #c4b5fd 52%,
                        #8B5CF6 65%,
                        #8B5CF6 100%
                    );
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: mh-hat-text-enter 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards,
                               mh-shimmer 4s ease-in-out 1.5s infinite;
                }

                .mh-logo-group:hover .mh-hat-text {
                    animation: mh-hat-glow-pulse 1s ease-in-out infinite;
                    -webkit-text-fill-color: #8B5CF6;
                    background: none;
                }
            `}</style>
            <header
                className={cn(
                    `hidden md:block top-0 left-0 z-50 bg-sidebar border-b sticky md:border-b-0 h-12 md:h-10`,
                    borderClass,
                )}
            >
                <div className="py-1 pr-4 md:pr-7 pl-11 mx-auto flex items-center justify-between">
                    <SidebarTrigger className="absolute left-4 md:left-2" />
                    {notification && notification !== "0" ? (
                        <Badge
                            variant="positive"
                            className={cn(
                                "text-xs font-bold px-2 h-5 dark:text-sidebar",
                                {
                                    "ml-1": isSidebarCollapsed,
                                },
                            )}
                        >
                            {notification}
                        </Badge>
                    ) : null}
                    {user?.banned ? (
                        <Badge
                            variant="destructive"
                            className="text-xs font-bold px-2 h-5 ml-2"
                        >
                            Banned
                        </Badge>
                    ) : null}
                    {inPreview ? (
                        <Badge
                            variant="warning"
                            className="text-xs font-bold px-2 h-5 ml-2"
                        >
                            Preview
                        </Badge>
                    ) : null}
                    <div
                        className={`flex h-full items-center pr-2 transition-all pl-4 md:pl-2`}
                    >
                        <Breadcrumb>
                            <BreadcrumbList>
                                {segments.map((segment, index) => (
                                    <React.Fragment key={index}>
                                        {index !== 0 && <BreadcrumbSeparator />}
                                        <BreadcrumbItem>
                                            {index === 0 ? (
                                                <Link
                                                    href="/"
                                                    className="mh-logo-group flex items-center gap-2 no-underline"
                                                    style={{
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    <Image
                                                        src="/icon.png"
                                                        alt="MangaHat"
                                                        width={28}
                                                        height={28}
                                                        className="mh-hat-icon invert dark:invert-0 mix-blend-multiply dark:mix-blend-screen"
                                                        priority
                                                    />
                                                    <span
                                                        className="text-lg font-extrabold tracking-tight"
                                                    >
                                                        <span className="mh-manga-text text-foreground">
                                                            Manga
                                                        </span>
                                                        <span className="mh-hat-text">
                                                            Hat
                                                        </span>
                                                    </span>
                                                </Link>
                                            ) : (
                                                <BreadcrumbLink
                                                    href={`/${originalSegments
                                                        .slice(0, index + 1)
                                                        .join("/")}`}
                                                    title={getSegmentDisplayName(
                                                        segment,
                                                        index,
                                                        segments,
                                                        9999,
                                                    )}
                                                    tabIndex={-1}
                                                >
                                                    {getSegmentDisplayName(
                                                        segment,
                                                        index,
                                                        segments,
                                                    )}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center flex-grow justify-end gap-2">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                        >
                            {isDark ? (
                                <Sun className="size-4" />
                            ) : (
                                <Moon className="size-4" />
                            )}
                        </button>
                        <SearchBar />
                    </div>
                </div>
            </header>
        </>
    );
}

