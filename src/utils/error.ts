import { ErrorWithMessage } from '../types';

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

export function createErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  
  // Check for specific error types and customize messages
  if (message.includes('NetworkError')) {
    return 'Network error occurred. Please check your connection and try again.';
  }
  
  if (message.includes('TypeError')) {
    return 'An unexpected error occurred. Please try again.';
  }
  
  if (message.includes('401')) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (message.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (message.includes('500')) {
    return 'A server error occurred. Please try again later.';
  }
  
  return message;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly validationErrors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Permission denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}