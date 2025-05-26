import React from 'react';
import { cn } from '../../utils/cn'; // Assuming cn utility exists

interface TagBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'red' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export function TagBadge({ 
  children, 
  variant = 'gray', 
  size = 'md',
  className 
}: TagBadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    blue: 'bg-accentBlue/20 text-accentBlue',
    purple: 'bg-accentPurple/20 text-accentPurple',
    green: 'bg-accentGreen/20 text-accentGreen',
    red: 'bg-accentRed/20 text-accentRed',
    gray: 'bg-neutralGray-light/70 text-neutralGray-dark', // Adjusted gray for better contrast with light backgrounds
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5', // Extra small text, less padding
    md: 'text-xs px-2.5 py-0.5',    // Small text, standard padding for tags
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export default TagBadge;
