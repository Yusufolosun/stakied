import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftElement,
  rightElement,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full mb-4 group animate-reveal">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-1.5 transition-colors group-focus-within:text-primary">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftElement && (
          <div className="absolute left-4 text-text-muted">
            {leftElement}
          </div>
        )}

        <input
          className={`
            w-full bg-white/5 border rounded-2xl px-4 py-3 text-main font-medium
            placeholder:text-text-dim transition-all duration-200 outline-none
            ${leftElement ? 'pl-11' : ''}
            ${rightElement ? 'pr-11' : ''}
            ${error
              ? 'border-error/50 focus:border-error focus:ring-4 focus:ring-error/10'
              : 'border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 group-hover:border-white/20'
            }
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-4 text-text-muted">
            {rightElement}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`mt-1.5 text-xs font-medium ${error ? 'text-error animate-shake' : 'text-text-dim'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};
