import { Skeleton } from "@/components/ui/skeleton";

export const DashboardLoadingSkeleton = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header Skeleton */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <Skeleton className="h-9 w-48" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-full md:w-64" />
          <Skeleton className="h-10 w-28" />
        </div>
      </header>

      <main>
        {/* Summary Widgets Skeleton */}
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </section>

        {/* Tabs Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Trip Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </main>
    </div>
  );
};