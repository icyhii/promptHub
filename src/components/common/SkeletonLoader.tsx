import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md",
        "relative overflow-hidden",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
        "after:animate-[shimmer_1.5s_infinite]",
        className
      )}
    />
  );
}

export function PromptCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-3/4" /> {/* Title */}
        <Skeleton className="h-6 w-10" /> {/* Rating */}
      </div>
      <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
      <Skeleton className="h-4 w-5/6" /> {/* Description line 2 */}
      <div className="flex gap-2"> {/* Tags */}
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
          <Skeleton className="h-4 w-32" /> {/* Author name */}
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Action button */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Action button */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Action button */}
        </div>
      </div>
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="mb-6">
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-6 w-1/3 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="mb-6">
        <Skeleton className="h-6 w-1/4 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="mb-6">
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="py-4 px-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </td>
      <td className="py-4 px-6">
        <Skeleton className="h-6 w-24" />
      </td>
      <td className="py-4 px-6">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="py-4 px-6">
        <Skeleton className="h-6 w-16" />
      </td>
      <td className="py-4 px-6">
        <Skeleton className="h-6 w-24" />
      </td>
      <td className="py-4 px-6">
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </td>
    </tr>
  );
}