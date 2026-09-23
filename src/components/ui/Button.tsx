import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline' | 'yellow' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'gradient-blue text-white hover:opacity-90 shadow-medium hover:shadow-strong',
    secondary: 'bg-white text-[#3A86EF] border-2 border-[#3A86EF] hover:bg-blue-50',
    success: 'gradient-success text-white hover:opacity-90 shadow-medium hover:shadow-strong',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-medium',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    outline: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#3A86EF] hover:text-[#3A86EF]',
    yellow: 'bg-[#FFD166] text-gray-900 hover:bg-[#F4B942] shadow-medium hover:shadow-strong font-bold',
    gradient: 'bg-gradient-to-r from-[#3A86EF] via-[#4EA8DE] to-[#7EC8E3] text-white hover:opacity-90 shadow-medium hover:shadow-strong font-bold',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
    xl: 'px-10 py-5 text-xl min-h-[60px]',
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center
        font-semibold rounded-xl
        transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0 hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
