"use client";

import { useActionState } from "react";
import { createSupplierAction } from "@/app/actions/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        "Create Agent"
      )}
    </Button>
  );
}

const initialState = {
  error: "",
};

export default function CreateSupplierPage() {
  const [state, dispatch] = useActionState(
    createSupplierAction as (
      state: typeof initialState,
      payload: FormData
    ) => Promise<typeof initialState>,
    initialState
  );

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="mb-4">
        <Link
          href="/transactions/create"
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transaction
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Agent (Supplier)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            {state?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Ko Hla"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" name="phone" placeholder="09..." />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
