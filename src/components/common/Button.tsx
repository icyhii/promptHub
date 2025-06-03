import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    // Base button styles with improved contrast ratios
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";
    
    // Variant styles with WCAG AA compliant contrast ratios
    const variantStyles = {
      primary: "bg-accentBlue text-white hover:bg-accentBlue/90 focus:ring-accentBlue disabled:bg-accentBlue/50",
      secondary: "bg-neutralGray-light text-textPrimary hover:bg-neutralGray-light/80 focus:ring-accentBlue disabled:bg-neutralGray-light/50",
      outline: "border-2 border-accentBlue bg-transparent text-accentBlue hover:bg-accentBlue/10 focus:ring-accentBlue disabled:border-accentBlue/50 disabled:text-accentBlue/50",
      ghost: "bg-transparent text-textPrimary hover:bg-neutralGray-light/70 focus:ring-accentBlue disabled:text-textPrimary/50",
      danger: "bg-accentRed text-white hover:bg-accentRed/90 focus:ring-accentRed disabled:bg-accentRed/50"
    };
    
    // Size styles with consistent tap targets
    const sizeStyles = {
      sm: "text-sm min-h-[32px] px-3 py-1.5",
      md: "text-base min-h-[40px] px-4 py-2",
      lg: "text-lg min-h-[48px] px-6 py-3"
    };
    
    // Disabled styles
    const disabledStyles = "opacity-60 cursor-not-allowed";

    // Generate accessible name if no aria-label is provided
    const buttonText = typeof children === 'string' ? children : undefined;
    const accessibleName = ariaLabel || buttonText;
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          (disabled || isLoading) && disabledStyles,
          className
        )}
        disabled={disabled || isLoading}
        aria-label={accessibleName}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="sr-only">Loading</span>
        )}
        {isLoading ? (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : leftIcon ? (
          <span className="mr-2" aria-hidden="true">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="ml-2" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;