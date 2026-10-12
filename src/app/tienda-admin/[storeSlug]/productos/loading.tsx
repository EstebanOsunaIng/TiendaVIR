import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/admin/list-skeleton";

export default function ProductosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-9 w-64" />
      <ListSkeleton />
    </div>
  );
}
