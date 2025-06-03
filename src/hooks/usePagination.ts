```typescript
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  preserveParams?: boolean;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  preserveParams = true
}: UsePaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page) : initialPage;
  });
  const [pageSize, setPageSize] = useState(() => {
    const size = searchParams.get('size');
    return size ? parseInt(size) : initialPageSize;
  });

  const totalPages = Math.ceil(totalItems / pageSize);

  useEffect(() => {
    if (preserveParams) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', currentPage.toString());
      newParams.set('size', pageSize.toString());
      setSearchParams(newParams);
    }
  }, [currentPage, pageSize, preserveParams]);

  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  }, [totalPages]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const offset = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    totalPages,
    offset,
    goToPage,
    changePageSize
  };
}
```