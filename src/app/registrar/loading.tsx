import { Skeleton, SkeletonHeader, SkeletonLinhas, Carregando } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-10">
      <Carregando o="a tela de registro" />
      <SkeletonHeader />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-[4.5rem]" alt />
        <Skeleton className="h-[4.5rem]" alt />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" alt />
      </div>
      <SkeletonLinhas n={3} />
    </div>
  );
}
