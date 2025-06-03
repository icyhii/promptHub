import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  tips?: string[];
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tips,
  className
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        "min-h-[400px] bg-white dark:bg-gray-800 rounded-lg border border-neutralGray-light",
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className="w-16 h-16 mb-6 text-neutralGray-medium" aria-hidden="true">
        {icon}
      </div>
      
      <h2 className="text-xl font-semibold text-textPrimary mb-2">
        {title}
      </h2>
      
      <p className="text-textSecondary mb-6 max-w-md">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            leftIcon={primaryAction.icon}
          >
            {primaryAction.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            leftIcon={secondaryAction.icon}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {tips && tips.length > 0 && (
        <div className="text-left w-full max-w-md">
          <h3 className="text-sm font-medium text-textPrimary mb-2">
            Helpful Tips:
          </h3>
          <ul className="list-disc list-inside space-y-1" role="list">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-textSecondary">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}