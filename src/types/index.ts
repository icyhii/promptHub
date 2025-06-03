// Common type definitions
export type ErrorWithMessage = {
  message: string;
  [key: string]: unknown;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ErrorWithMessage | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SortDirection = 'asc' | 'desc';

export type SortOptions = {
  field: string;
  direction: SortDirection;
};

export type FilterOptions = {
  [key: string]: unknown;
};

export type QueryOptions = {
  page?: number;
  pageSize?: number;
  sort?: SortOptions;
  filters?: FilterOptions;
};

// User types
export type UserRole = 'admin' | 'editor' | 'viewer';

export type User = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

// Error types
export type ValidationError = {
  field: string;
  message: string;
};

export type ApiError = {
  code: string;
  message: string;
  validationErrors?: ValidationError[];
};

// Utility types
export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

export type ActionState = {
  status: ActionStatus;
  error: Error | null;
};