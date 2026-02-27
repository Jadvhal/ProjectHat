"use client";

import { publicClient } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
    Bookmark,
    ImageIcon,
    MessageCircle,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, BadgeVariantProps } from "../ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface UserStatProps {
    icon: React.ReactElement;
    label: string;
    value: number;
}

function UserStat({ icon, label, value }: UserStatProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex flex-row items-center gap-0.5 pr-1 pl-0.5">
                    {icon}
                    <span>{value}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}

const ROLE_VARIANT_MAP: Record<
    components["schemas"]["UserRole"],
    BadgeVariantProps["variant"]
> = {
    user: "default",
    admin: "info",
    moderator: "positive",
    owner: "warning",
};

export function UserHeaderClient({ userId }: { userId: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["user-profile", userId],
        queryFn: async () => {
            const { data, error } = await publicClient.GET(
                "/v2/user/{userId}",
                {
                    params: {
                        path: { userId },
                    },
                },
            );

            if (error || !data) {
                throw new Error("Failed to fetch user data");
            }

            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <Skeleton className="h-16 md:h-10 w-full" />;
    }

    if (error || !data) {
        return (
            <div className="text-center text-muted-foreground py-4">
                Failed to load user profile.
            </div>
        );
    }

    const userScore = data.totalUpvotes - data.totalDownvotes;
    return (
        <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-baseline md:gap-2">
                <div className="flex flex-row gap-2 items-baseline">
                    <Avatar name={data.username} />
                    <h2 className="text-4xl font-bold">
                        {data.displayName || data.username}
                    </h2>
                </div>
                <div className="flex flex-row gap-2 items-baseline">
                    <p className="text-muted-foreground leading-right">
                        @{data.username}
                    </p>
                    {data.banned ? (
                        <Badge className="self-center" variant="destructive">
                            Banned
                        </Badge>
                    ) : null}
                    {data.role !== "user" ? (
                        <Badge
                            className="self-center"
                            variant={ROLE_VARIANT_MAP[data.role]}
                        >
                            {capitalize(data.role)}
                        </Badge>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-row divide-x font-medium">
                <TooltipProvider>
                    <UserStat
                        icon={<Bookmark className="size-5" />}
                        label="Bookmarks"
                        value={data.totalBookmarks}
                    />
                    <UserStat
                        icon={<MessageCircle className="size-5" />}
                        label="Comments"
                        value={data.totalComments}
                    />
                    <UserStat
                        icon={
                            userScore >= 0 ? (
                                <TrendingUp className="size-5 text-accent-positive" />
                            ) : (
                                <TrendingDown className="size-5 text-negative" />
                            )
                        }
                        label="Comment Score"
                        value={userScore}
                    />
                    <UserStat
                        icon={<ImageIcon className="size-5" />}
                        label="Attachments"
                        value={data.totalUploads}
                    />
                </TooltipProvider>
            </div>
        </div>
    );
}
