import { Skeleton, SkeletonHeader, Carregando } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Carregando o="suas receitas" />
      <SkeletonHeader />
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${i % 3 === 1 ? "rounded-card-alt" : "rounded-card"} bg-surface p-2 shadow-soft`}>
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="px-3 pb-3 pt-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
