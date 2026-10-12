import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogoLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-64 rounded-2xl sm:h-80" />
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
