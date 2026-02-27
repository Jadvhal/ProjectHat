import { Separator } from "@/components/ui/separator";
import { UserHeaderClient } from "@/components/user/users-header-client";
import { UserListsClient } from "@/components/user/user-lists-client";
import { client, serverHeaders } from "@/lib/api";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { id } = await props.params;
    const { data, error } = await client.GET("/v2/user/{userId}", {
        params: {
            path: {
                userId: id,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return {
            title: "User Not Found",
            description: "The requested user could not be found.",
        };
    }

    const user = data.data;

    return createMetadata({
        title: user.displayName || user.username,
        description:
            "View the profile of " + (user.displayName || user.username),
        canonicalPath: `/user/${id}`,
    });
}

export default async function UserPage(props: PageProps) {
    const { id } = await props.params;

    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 w-full h-full">
            <UserHeaderClient userId={id} />
            <Separator className="my-2" />
            <UserListsClient userId={id} />
        </div>
    );
}
