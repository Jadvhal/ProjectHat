export function getVisiblePages(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
        // Show all pages if total is small
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();

    // Always show first page and last page
    pages.add(1);
    pages.add(totalPages);

    if (currentPage <= 4) {
        // Near the start: show 1 2 3 4 ... last
        for (let i = 1; i <= Math.min(4, totalPages); i++) {
            pages.add(i);
        }
    } else if (currentPage >= totalPages - 3) {
        // Near the end: show 1 ... (last-3) (last-2) (last-1) last
        for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.add(i);
        }
    } else {
        // In the middle: show 1 ... (current-1) current (current+1) ... last
        pages.add(currentPage - 1);
        pages.add(currentPage);
        pages.add(currentPage + 1);
    }

    return Array.from(pages).sort((a, b) => a - b);
}
