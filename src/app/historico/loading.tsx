import { Skeleton, SkeletonHeader, SkeletonLinhas, Carregando } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-10">
      <Carregando o="seu histórico" />
      <SkeletonHeader />
      <div className="rounded-card bg-surface p-6 shadow-soft md:p-8">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-5 h-52 w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="rounded-card-alt bg-surface p-5 shadow-soft">
          <Skeleton className="mx-auto h-7 w-40" />
          <div className="mt-5 grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-card bg-surface p-6 shadow-soft">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-7 w-56" />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
          <div className="rounded-card bg-surface p-5 shadow-soft">
            <SkeletonLinhas n={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
