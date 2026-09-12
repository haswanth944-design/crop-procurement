import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap active:scale-[0.98]';

  const variantClasses = {
    primary: 'bg-emerald-800 hover:bg-emerald-900 text-white focus:ring-emerald-700 shadow-sm shadow-emerald-950/10 border border-emerald-700',
    secondary: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-emerald-600',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
  }[variant];

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[42px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]'
  }[size];

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
