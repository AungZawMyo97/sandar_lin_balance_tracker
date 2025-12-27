"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
}

export function CustomPagination({ currentPage, totalPages }: CustomPaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const generatePagination = (currentPage: number, totalPages: number) => {
        // If the total number of pages is 7 or less,
        // display all pages without any ellipsis.
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // If the current page is among the first 3 pages,
        // show the first 3, an ellipsis, and the last 2 pages.
        if (currentPage <= 3) {
            return [1, 2, 3, "...", totalPages - 1, totalPages];
        }

        // If the current page is among the last 3 pages,
        // show the first 2, an ellipsis, and the last 3 pages.
        if (currentPage >= totalPages - 2) {
            return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
        }

        // If the current page is somewhere in the middle,
        // show the first page, an ellipsis, the current page and its neighbors,
        // another ellipsis, and the last page.
        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    };

    const allPages = generatePagination(currentPage, totalPages);

    return (
        <div className="flex items-center justify-center space-x-2">
            <Button variant="outline" size="icon" asChild disabled={currentPage <= 1}>
                {currentPage <= 1 ? (
                    <span className="opacity-50 pointer-events-none"><ChevronLeft className="h-4 w-4" /></span>
                ) : (
                    <Link href={createPageURL(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                )}
            </Button>

            <div className="flex items-center space-x-1">
                {allPages.map((page, index) => {
                    if (page === "...") {
                        return (
                            <div key={index} className="px-2 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        );
                    }

                    return (
                        <Button
                            key={index}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            asChild
                        >
                            <Link href={createPageURL(page)}>
                                {page}
                            </Link>

                        </Button>
                    );
                })}
            </div>

            <Button variant="outline" size="icon" asChild disabled={currentPage >= totalPages}>
                {currentPage >= totalPages ? (
                    <span className="opacity-50 pointer-events-none"><ChevronRight className="h-4 w-4" /></span>
                ) : (
                    <Link href={createPageURL(currentPage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </Button>
        </div>
    );
}
