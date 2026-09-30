import { Skeleton, SkeletonHeader, Carregando } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Carregando o="sua despensa" />
      <SkeletonHeader />
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-12 min-w-[14rem] flex-1 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g}>
          <Skeleton className="h-7 w-40" />
          <div className="mt-3 divide-y divide-line">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-3 h-2 w-48" />
                </div>
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
