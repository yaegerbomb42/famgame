import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    animate?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading, animate = true, className = '', children, disabled, ...props }, ref) => {
        const baseClasses = 'font-bold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed no-select';

        const variantClasses = {
            primary: 'bg-game-primary text-white shadow-glow-magenta hover:brightness-110',
            secondary: 'bg-game-secondary text-game-bg shadow-glow-cyan hover:brightness-110',
            ghost: 'bg-white/5 text-white border-2 border-white/10 hover:bg-white/10 hover:border-white/20',
            danger: 'bg-red-500 text-white shadow-glow-red hover:bg-red-600',
        };

        const sizeClasses = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
            xl: 'px-12 py-6 text-2xl md:text-3xl',
        };

        const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

        const loadingContent = (
            <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
            </span>
        );

        if (animate) {
            return (
                <motion.button
                    ref={ref}
                    whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
                    whileTap={disabled ? undefined : { scale: 0.98 }}
                    className={classes}
                    disabled={disabled || loading}
                >
                    {loading ? loadingContent : children}
                </motion.button>
            );
        }

        return (
            <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
                {loading ? loadingContent : children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
