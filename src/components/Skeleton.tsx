export function SkeletonLine({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded-lg shimmer`} />;
}

export function SkeletonCard({ h = "h-28" }: { h?: string }) {
  return <div className={`w-full ${h} rounded-xl shimmer border border-[#252538]`} />;
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-[#252538] bg-[#13131f] p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-2.5 w-16 rounded shimmer" />
        <div className="h-6 w-6 rounded-lg shimmer" />
      </div>
      <div className="h-8 w-20 rounded shimmer" />
      <div className="h-2.5 w-24 rounded shimmer" />
    </div>
  );
}

export function SkeletonNewsCard() {
  return (
    <div className="rounded-xl border border-[#252538] bg-[#13131f] p-4 space-y-3">
      <div className="h-32 w-full rounded-lg shimmer" />
      <div className="h-3 w-3/4 rounded shimmer" />
      <div className="h-3 w-full rounded shimmer" />
      <div className="h-3 w-2/3 rounded shimmer" />
      <div className="h-2.5 w-1/3 rounded shimmer mt-1" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#252538] bg-[#13131f]">
      <div className="h-8 w-8 rounded-lg shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 rounded shimmer" />
        <div className="h-2.5 w-1/3 rounded shimmer" />
      </div>
      <div className="h-4 w-12 rounded shimmer" />
    </div>
  );
}
