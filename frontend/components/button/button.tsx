import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'outline' | 'ghost';
  color?: 'primary' | 'secondary';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
};

const sizeClasses = {
  xs: 'px-2 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg',
  xl: 'px-6 py-3.5 text-xl',
};

const colorClasses = {
  primary: {
    filled: `
      bg-primary-800 text-white
      hover:bg-primary-700
      focus:bg-primary-500 focus:ring-2 focus:ring-primary-200 focus:ring-offset-2
      active:bg-primary-700
      disabled:bg-primary-200 disabled:text-primary-400
    `,
    outline: `
      border border-primary-500 text-primary-500 bg-transparent
      hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50
      focus:ring-2 focus:ring-primary-200 focus:ring-offset-2
      active:border-primary-700 active:text-primary-700 active:bg-primary-100
      disabled:border-primary-200 disabled:text-primary-300
    `,
    ghost: `
      text-primary-500 bg-transparent
      hover:text-primary-600 hover:bg-primary-50
      focus:ring-2 focus:ring-primary-200 focus:ring-offset-2
      active:text-primary-700 active:bg-primary-100
      disabled:text-primary-300
    `,
  },
  secondary: {
    filled: `
      bg-secondary-500 text-white
      hover:bg-secondary-600
      focus:bg-secondary-500 focus:ring-2 focus:ring-secondary-200 focus:ring-offset-2
      active:bg-secondary-700
      disabled:bg-secondary-200 disabled:text-secondary-400
    `,
    outline: `
      border border-secondary-500 text-secondary-500 bg-transparent
      hover:border-secondary-600 hover:text-secondary-600 hover:bg-secondary-50
      focus:ring-2 focus:ring-secondary-200 focus:ring-offset-2
      active:border-secondary-700 active:text-secondary-700 active:bg-secondary-100
      disabled:border-secondary-200 disabled:text-secondary-300
    `,
    ghost: `
      text-secondary-500 bg-transparent
      hover:text-secondary-600 hover:bg-secondary-50
      focus:ring-2 focus:ring-secondary-200 focus:ring-offset-2
      active:text-secondary-700 active:bg-secondary-100
      disabled:text-secondary-300
    `,
  },
};

export const Button = ({
  size = 'md',
  variant = 'filled',
  color = 'primary',
  className = '',
  leftIcon,
  rightIcon,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={disabled}
      type="button"
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        'disabled:cursor-not-allowed',
        // Size variations
        sizeClasses[size],
        // Color and variant combinations
        colorClasses[color][variant],
        // Additional classes
        className
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};
