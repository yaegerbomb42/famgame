import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient-border' | 'game';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', hover = false, padding = 'md', className = '', children, ...props }, ref) => {
        const baseClasses = 'rounded-3xl transition-all duration-300';

        const variantClasses = {
            default: 'glass-card',
            glass: 'glass',
            'gradient-border': 'gradient-border',
            game: 'glass-card cursor-pointer',
        };

        const hoverClasses = hover ? 'hover:-translate-y-1 hover:border-game-primary/30' : '';

        const paddingClasses = {
            none: '',
            sm: 'p-3',
            md: 'p-6',
            lg: 'p-8',
        };

        const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${paddingClasses[padding]} ${className}`;

        return (
            <div ref={ref} className={classes} {...props}>
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
