import { useCallback } from 'react';

interface ErrorDetails {
  error: Error;
  componentStack?: string;
  context?: Record<string, unknown>;
}

export function useErrorReporting() {
  const reportError = useCallback(async (details: ErrorDetails) => {
    const { error, componentStack, context } = details;

    // Prepare error report
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('Error Report');
        console.error(error);
        console.info('Component Stack:', componentStack);
        console.info('Context:', context);
        console.groupEnd();
        return;
      }

      // Here you would typically send to your error monitoring service
      // Example: await fetch('/api/error-logging', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      // For now, we'll just log to console
      console.error('Error Report:', errorReport);
    } catch (reportingError) {
      // Fallback error logging
      console.error('Failed to report error:', reportingError);
      console.error('Original error:', error);
    }
  }, []);

  return { reportError };
}