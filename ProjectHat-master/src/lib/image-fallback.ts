/**
 * Generates an inline SVG data URI to use as a fallback when a manga cover image fails to load.
 */
export const FALLBACK_COVER =
    "data:image/svg+xml," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#1a1a2e"/>
  <text x="100" y="140" text-anchor="middle" fill="#555" font-size="14" font-family="system-ui,sans-serif">No Image</text>
  <text x="100" y="165" text-anchor="middle" fill="#555" font-size="14" font-family="system-ui,sans-serif">Available</text>
</svg>`,
    );

// In-memory cache for AniList cover lookups (avoids repeated API calls)
const anilistCoverCache = new Map<string, string | null>();

/**
 * Fetches a manga cover image URL from AniList's public GraphQL API.
 * Tries aniId first, then falls back to malId.
 */
async function fetchAniListCover(
    aniId?: number | null,
    malId?: number | null,
): Promise<string | null> {
    if (!aniId && !malId) return null;

    const cacheKey = `ani:${aniId ?? ""}_mal:${malId ?? ""}`;
    if (anilistCoverCache.has(cacheKey)) {
        return anilistCoverCache.get(cacheKey) ?? null;
    }

    const query = `
        query ($id: Int, $idMal: Int) {
            Media(id: $id, idMal: $idMal, type: MANGA) {
                coverImage {
                    large
                }
            }
        }
    `;

    // Try aniId first, then malId
    const attempts: { id?: number; idMal?: number }[] = [];
    if (aniId) attempts.push({ id: aniId });
    if (malId) attempts.push({ idMal: malId });

    for (const variables of attempts) {
        try {
            const response = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables }),
            });

            if (!response.ok) continue;

            const json = await response.json();
            const coverUrl = json?.data?.Media?.coverImage?.large;

            if (coverUrl && typeof coverUrl === "string") {
                anilistCoverCache.set(cacheKey, coverUrl);
                return coverUrl;
            }
        } catch {
            // Silently continue to next attempt
        }
    }

    anilistCoverCache.set(cacheKey, null);
    return null;
}

/**
 * Creates an onError handler for Next.js Image components that:
 * 1. Tries to fetch the cover from AniList (using aniId or malId)
 * 2. Falls back to a static "No Image Available" placeholder
 */
export function createImageErrorHandler(
    aniId?: number | null,
    malId?: number | null,
) {
    return async (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;

        // Prevent infinite error loops
        if (target.dataset.fallbackAttempted === "true") return;
        target.dataset.fallbackAttempted = "true";

        // Immediately show placeholder while we try AniList
        target.srcset = "";
        target.src = FALLBACK_COVER;

        // Try fetching from AniList
        const anilistCover = await fetchAniListCover(aniId, malId);
        if (anilistCover) {
            target.src = anilistCover;
        }
    };
}

/**
 * Simple onError handler that just shows the placeholder.
 * Use this when aniId/malId are not available.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    const target = e.currentTarget;
    if (target.src !== FALLBACK_COVER) {
        target.srcset = "";
        target.src = FALLBACK_COVER;
    }
}
