import { Skeleton } from "@/components/ui/skeleton";

export function RouteLoadingFallback() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16" aria-busy="true" aria-label="Loading page">
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="h-5 w-3/4 max-w-xl" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </section>
  );
}
