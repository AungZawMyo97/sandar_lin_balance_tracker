import { createSupplierAction } from "@/app/actions/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateSupplierPage() {
    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="mb-4">
                <Link href="/transactions/create" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transaction
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Agent (Supplier)</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createSupplierAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Agent Name</Label>
                            <Input id="name" name="name" required placeholder="e.g. Ko Hla" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input id="phone" name="phone" placeholder="09..." />
                        </div>
                        <Button type="submit" className="w-full">Create Agent</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
