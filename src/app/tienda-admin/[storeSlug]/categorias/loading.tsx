import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/admin/list-skeleton";

export default function CategoriasLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-16 w-full max-w-md" />
      <ListSkeleton rows={4} />
    </div>
  );
}
