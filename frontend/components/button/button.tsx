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
      bg-primary-color-50 text-secondary-color-70
      hover:bg-primary-color-70
      focus:bg-primary-color-50 focus:ring-2 focus:ring-primary-color-20 focus:ring-offset-2
      active:bg-primary-color-70
      disabled:bg-primary-color-20 disabled:text-primary-color-40
    `,
    outline: `
      border border-primary-color-50 text-primary-color-50 bg-transparent
      hover:border-primary-color-60 hover:text-primary-color-60 hover:bg-primary-color-20
      focus:ring-2 focus:ring-primary-color-20 focus:ring-offset-2
      active:border-primary-color-70 active:text-primary-color-70 active:bg-primary-color-10
      disabled:border-primary-color-20 disabled:text-primary-color-30
    `,
    ghost: `
      text-primary-color-50 bg-transparent
      hover:text-primary-color-60 hover:bg-primary-color-20
      focus:ring-2 focus:ring-primary-color-20 focus:ring-offset-2
      active:text-primary-color-70 active:bg-primary-color-10
      disabled:text-primary-color-30
    `,
  },
  secondary: {
    filled: `
      bg-secondary-color-50 text-white
      hover:bg-secondary-color-60
      focus:bg-secondary-color-50 focus:ring-2 focus:ring-secondary-color-20 focus:ring-offset-2
      active:bg-secondary-color-70
      disabled:bg-secondary-color-20 disabled:text-secondary-color-40
    `,
    outline: `
      border border-secondary-color-50 text-secondary-color-50 bg-transparent
      hover:border-secondary-color-60 hover:text-secondary-color-60 hover:bg-secondary-color-20
      focus:ring-2 focus:ring-secondary-color-20 focus:ring-offset-2
      active:border-secondary-color-70 active:text-secondary-color-70 active:bg-secondary-color-10
      disabled:border-secondary-color-20 disabled:text-secondary-color-30
    `,
    ghost: `
      text-secondary-color-50 bg-transparent
      hover:text-secondary-color-60 hover:bg-secondary-color-20
      focus:ring-2 focus:ring-secondary-color-20 focus:ring-offset-2
      active:text-secondary-color-70 active:bg-secondary-color-10
      disabled:text-secondary-color-30
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
