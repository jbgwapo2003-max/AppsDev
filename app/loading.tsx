export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-5">
          <div className="h-72 animate-pulse rounded-lg bg-white/80 shadow-sm" />
          <div className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
            <div className="h-5 w-32 animate-pulse rounded bg-smoke" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-smoke" />
            <div className="h-4 w-full animate-pulse rounded bg-smoke" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-smoke" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-32 animate-pulse rounded-lg bg-white/80 shadow-sm" />
            <div className="h-32 animate-pulse rounded-lg bg-white/80 shadow-sm" />
          </div>
        </section>
        <aside className="space-y-4">
          <div className="h-40 animate-pulse rounded-lg bg-white/80 shadow-sm" />
          <div className="h-40 animate-pulse rounded-lg bg-white/80 shadow-sm" />
        </aside>
      </div>
    </main>
  );
}
