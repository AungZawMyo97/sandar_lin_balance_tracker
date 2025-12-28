import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TransactionsLoading() {
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-10 w-[160px]" />
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-[100px] mb-2" />
                    <Skeleton className="h-4 w-[250px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Header Row */}
                        <div className="flex justify-between pb-4 border-b">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>

                        {/* Data Rows */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex justify-between py-2">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
