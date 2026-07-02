import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, disabled = false, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        disabled={disabled}
        className={`min-h-[44px] rounded-lg border px-3 text-sm text-gray-800 shadow-sm transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-300'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
        } ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-white'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default Input;
