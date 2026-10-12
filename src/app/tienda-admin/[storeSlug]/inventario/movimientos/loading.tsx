import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/admin/list-skeleton";

export default function MovimientosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <ListSkeleton rows={8} />
    </div>
  );
}
