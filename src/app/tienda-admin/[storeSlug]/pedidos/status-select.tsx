"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderRequestStatus } from "@/actions/order-requests/update-order-request-status";
import type { OrderRequestStatus } from "@/lib/constants";

const STATUS_LABELS: Record<OrderRequestStatus, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export function StatusSelect({
  storeSlug,
  orderRequestId,
  status,
}: {
  storeSlug: string;
  orderRequestId: string;
  status: OrderRequestStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      await updateOrderRequestStatus(storeSlug, orderRequestId, value as OrderRequestStatus);
      router.refresh();
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
