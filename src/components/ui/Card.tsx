import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'yellow' | 'none';
  glass?: boolean;
  hover?: boolean;
  hoverable?: boolean;
  glow?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  gradient = 'none',
  glass = false,
  hover = false,
  hoverable = false,
  glow = false
}: CardProps) {
  const gradients = {
    purple: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600',
    pink: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500',
    blue: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
    green: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500',
    orange: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500',
    yellow: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500',
    none: 'bg-white'
  };

  const shouldHover = hover || hoverable;

  const baseClasses = `
    rounded-2xl
    ${glass ? 'glass' : ''}
    ${shouldHover ? 'hover-lift' : ''}
    ${glow ? 'shadow-glow' : 'shadow-modern'}
    transition-all duration-300
    ${className}
  `;

  return (
    <div className={gradient !== 'none' ? `${gradients[gradient]} ${baseClasses}` : baseClasses}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-5 border-b border-white/20 ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`px-6 py-6 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-white/20 bg-white/5 ${className}`}>
      {children}
    </div>
  );
}
