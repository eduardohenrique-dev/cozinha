import { Skeleton, SkeletonCard, SkeletonHeader, Carregando } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-10">
      <Carregando o="o seu dia" />
      <SkeletonHeader />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="rounded-card bg-surface p-6 shadow-soft md:p-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
            <Skeleton className="h-52 w-52 rounded-full" />
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        </div>
        <div className="rounded-card bg-surface p-6 shadow-soft">
          <Skeleton className="mx-auto h-44 w-28" />
          <Skeleton className="mt-5 h-10 w-40" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-14 w-32 rounded-full" />
            <Skeleton className="h-14 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonCard alt />
        <SkeletonCard />
      </div>
    </div>
  );
}
