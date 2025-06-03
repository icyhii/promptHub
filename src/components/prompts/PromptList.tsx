```tsx
import { useState } from 'react';
import { usePrompts } from '../../hooks/usePrompts';
import { usePagination } from '../../hooks/usePagination';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Pagination from '../common/Pagination';
import { PromptCardSkeleton, TableRowSkeleton } from '../common/SkeletonLoader';
import Button from '../common/Button';
import { Loader } from 'lucide-react';

interface PromptListProps {
  view?: 'grid' | 'table';
  infiniteScroll?: boolean;
  filters?: any;
  onPromptSelect?: (promptId: string) => void;
}

export default function PromptList({
  view = 'grid',
  infiniteScroll = false,
  filters,
  onPromptSelect
}: PromptListProps) {
  const [loadedPrompts, setLoadedPrompts] = useState<any[]>([]);
  const { prompts, isLoading } = usePrompts({
    ...filters,
    limit: infiniteScroll ? 20 : undefined
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    offset,
    goToPage,
    changePageSize
  } = usePagination({
    totalItems: prompts?.length || 0,
    initialPageSize: 10
  });

  const loadMorePrompts = async () => {
    // Simulate loading more prompts
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPrompts = prompts?.slice(loadedPrompts.length, loadedPrompts.length + 20) || [];
    setLoadedPrompts([...loadedPrompts, ...newPrompts]);
  };

  const {
    targetRef,
    isLoading: isLoadingMore,
    hasMore
  } = useInfiniteScroll({
    onLoadMore: loadMorePrompts,
    hasMore: infiniteScroll && loadedPrompts.length < (prompts?.length || 0),
    isLoading
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PromptCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const displayedPrompts = infiniteScroll
    ? loadedPrompts
    : prompts?.slice(offset, offset + pageSize) || [];

  return (
    <div className="space-y-4">
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="cursor-pointer"
              onClick={() => onPromptSelect?.(prompt.id)}
            >
              {/* Prompt card content */}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {displayedPrompts.map((prompt) => (
                <tr
                  key={prompt.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => onPromptSelect?.(prompt.id)}
                >
                  {/* Table row content */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {infiniteScroll ? (
        <>
          <div ref={targetRef} className="h-20 flex items-center justify-center">
            {isLoadingMore && (
              <Button variant="ghost" disabled>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </Button>
            )}
          </div>
          {!hasMore && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No more prompts to load
            </p>
          )}
        </>
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={prompts?.length || 0}
          pageSize={pageSize}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          className="mt-6"
        />
      )}
    </div>
  );
}
```