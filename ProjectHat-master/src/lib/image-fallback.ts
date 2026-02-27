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

/**
 * onError handler for Next.js Image components.
 * Replaces the broken src with a placeholder SVG.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    const target = e.currentTarget;
    if (target.src !== FALLBACK_COVER) {
        target.srcset = "";
        target.src = FALLBACK_COVER;
    }
}
