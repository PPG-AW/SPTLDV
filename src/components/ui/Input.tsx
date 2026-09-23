import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-white border rounded-md text-base transition-colors focus:outline-none focus:border-black ${
            error
              ? 'border-black bg-gray-50'
              : 'border-gray-400'
          } ${className}`}
          style={{ fontSize: '16px' }}
          {...props}
        />
        {error && <p className="text-sm text-gray-900 font-medium">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-600">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
