import { getCurrentUser } from "@/lib/session";
import { TransactionService } from "@/app/services/transactionService";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { CustomPagination } from "@/components/shared/custom-pagination";

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const userId = await getCurrentUser();
    if (!userId) redirect("/login");

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const limit = 20;

    const { data, meta } = await TransactionService.getHistory(parseInt(userId), {
        page,
        limit,
    });

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">
                        View and manage your exchange history.
                    </p>
                </div>
                <Link href="/transactions/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Transaction
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                    <CardDescription>A list of all your exchange transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionsTable data={data as any} />
                </CardContent>
                <div className="p-4 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {data.length} entries (Page {page} of {meta.totalPages || 1})
                    </div>
                    <CustomPagination currentPage={page} totalPages={meta.totalPages || 1} />
                </div>
            </Card>
        </div>
    );
}
