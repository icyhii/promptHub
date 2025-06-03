import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  role?: string;
  'aria-labelledby'?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

export function Card({ 
  children, 
  className, 
  role = 'region', 
  onClick,
  isClickable = !!onClick,
  ...props 
}: CardProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow border border-neutralGray-light overflow-hidden',
        isClickable && 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-accentBlue/30 hover:translate-y-[-2px]',
        className
      )}
      role={role}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function CardHeader({ children, className, id }: CardHeaderProps) {
  return (
    <div 
      className={cn(
        'px-6 py-4 border-b border-neutralGray-light bg-transparent',
        className
      )}
      id={id}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 2 | 3 | 4 | 5 | 6;
}

export function CardTitle({ children, className, level = 2 }: CardTitleProps) {
  const Heading = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Heading className={cn('text-lg font-semibold text-textPrimary', className)}>
      {children}
    </Heading>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn(
      'px-6 py-3 bg-transparent border-t border-neutralGray-light',
      className
    )}>
      {children}
    </div>
  );
}