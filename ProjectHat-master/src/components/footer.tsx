import Link from "next/link";

export default async function Footer() {
    return (
        <footer className="flex flex-col justify-center border-t h-16 flex-shrink-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-base">
                        &copy; {new Date().getFullYear()} MangaHat
                    </p>
                    <div className="flex flex-row items-center gap-6">
                        <Link
                            href="/about"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            prefetch={false}
                        >
                            About
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            prefetch={false}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            prefetch={false}
                        >
                            Terms
                        </Link>
                        <Link
                            href="https://github.com/sn0w12/akari"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            prefetch={false}
                        >
                            GitHub
                        </Link>
                        <Link
                            href="https://github.com/sn0w12/akari/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            prefetch={false}
                        >
                            Report issues
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
