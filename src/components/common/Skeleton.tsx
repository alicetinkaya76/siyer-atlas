import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className, width, height, rounded }: SkeletonProps) {
  return (
    <div
      className={clsx('skeleton', rounded && 'rounded-full', className)}
      style={{ width, height, minHeight: height ?? 16 }}
      aria-hidden="true"
    />
  );
}

/** Card skeleton for lists */
export function CardSkeleton() {
  return (
    <div className="card overflow-hidden p-0">
      <Skeleton height={180} className="w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton height={20} width="70%" />
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="50%" />
        <div className="mt-2 flex gap-2">
          <Skeleton height={22} width={60} className="rounded-full" />
          <Skeleton height={22} width={80} className="rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** List item skeleton for episode/companion/battle lists */
export function ListItemSkeleton() {
  return (
    <div className="card flex items-center gap-3 p-3">
      <Skeleton width={40} height={40} rounded />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton height={16} width="60%" />
        <Skeleton height={12} width="40%" />
      </div>
      <Skeleton height={22} width={50} className="rounded-full" />
    </div>
  );
}

/** Grid of card skeletons */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** List of item skeletons */
export function ListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/** Stats dashboard skeleton */
export function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card flex flex-col items-center gap-2 p-4">
            <Skeleton height={24} width={24} rounded />
            <Skeleton height={20} width="50%" />
            <Skeleton height={12} width="70%" />
          </div>
        ))}
      </div>
      <Skeleton height={300} className="w-full rounded-lg" />
    </div>
  );
}
