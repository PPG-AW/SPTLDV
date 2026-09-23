import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: 'blue' | 'tosca' | 'yellow' | 'success' | 'warm' | 'purple' | 'orange' | 'none';
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
    blue: 'gradient-blue',
    tosca: 'bg-gradient-to-br from-[#4EA8DE] via-[#7EC8E3] to-[#A7D8F0]',
    yellow: 'bg-gradient-to-br from-[#FFD166] via-[#F4B942] to-[#FB923C]',
    success: 'gradient-success',
    warm: 'gradient-warm',
    purple: 'bg-gradient-to-br from-[#7209B7] via-[#560BAD] to-[#3A0CA3]',
    orange: 'bg-gradient-to-br from-[#FB8500] via-[#FB923C] to-[#F4B942]',
    none: 'bg-white',
  };

  const shouldHover = hover || hoverable;

  const baseClasses = `
    rounded-2xl
    ${glass && gradient === 'none' ? 'glass' : ''}
    ${shouldHover ? 'hover-lift' : ''}
    ${glow ? 'shadow-glow-blue' : gradient === 'none' ? 'shadow-soft' : 'shadow-medium'}
    transition-all duration-300
    ${gradient !== 'none' ? 'text-white' : ''}
    ${className}
  `;

  return (
    <div className={gradient !== 'none' ? `${gradients[gradient]} ${baseClasses}` : baseClasses}>
      {children}
    </div>
  );
}

interface CardHeaderProps { children: ReactNode; className?: string; }
export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`px-6 py-5 border-b border-gray-100 ${className}`}>{children}</div>;
}

interface CardBodyProps { children: ReactNode; className?: string; }
export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

interface CardFooterProps { children: ReactNode; className?: string; }
export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl ${className}`}>{children}</div>;
}
