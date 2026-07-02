const VARIANTES = {
  primario: 'bg-primary-700 text-white shadow-sm hover:bg-primary-800 disabled:bg-primary-300',
  secundario: 'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400',
  peligro: 'bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:bg-red-300',
};

export default function Button({
  children,
  variante = 'primario',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:shadow-none ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
