"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChaptersSectionClient } from "./chapters";
import { MangaRecommendationsClient } from "./recommended";

export function MangaDetailsBody({ id }: { id: string }) {
    return (
        <Tabs defaultValue="chapters" className="w-full">
            <TabsList className="bg-background p-0 gap-2">
                <TabsTrigger
                    className="text-xl py-0 md:text-2xl font-bold px-0 border-0 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background dark:data-[state=active]:bg-background"
                    value="chapters"
                >
                    Chapters
                </TabsTrigger>
                <TabsTrigger
                    className="text-xl py-0 md:text-2xl font-bold px-0 border-0 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background dark:data-[state=active]:bg-background"
                    value="recommendations"
                >
                    Recommendations
                </TabsTrigger>
            </TabsList>

            <TabsContent value="chapters">
                <ChaptersSectionClient id={id} />
            </TabsContent>

            <TabsContent value="recommendations" className="mb-2">
                <MangaRecommendationsClient id={id} />
            </TabsContent>
        </Tabs>
    );
}
