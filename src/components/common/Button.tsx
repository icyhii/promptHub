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
    ...props 
  }, ref) => {
    // Base button styles
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    // Variant styles
    const variantStyles = {
      primary: "bg-accentBlue text-white hover:bg-accentBlue/90 focus:ring-accentBlue",
      secondary: "bg-neutralGray-light text-textPrimary hover:bg-neutralGray-light/80 focus:ring-accentBlue",
      outline: "border border-accentBlue bg-transparent text-accentBlue hover:bg-accentBlue/10 focus:ring-accentBlue",
      ghost: "bg-transparent text-textPrimary hover:bg-neutralGray-light/70 focus:ring-accentBlue",
      danger: "bg-accentRed text-white hover:bg-accentRed/90 focus:ring-accentRed",
    };
    
    // Size styles
    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-6 py-3",
    };
    
    // Disabled styles
    const disabledStyles = "opacity-60 cursor-not-allowed";
    
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
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;