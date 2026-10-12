import { Skeleton } from "@/components/ui/skeleton";

export default function ProductoLoading() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-full max-w-xs" />
        <Skeleton className="h-11 w-full max-w-xs" />
      </div>
    </div>
  );
}
