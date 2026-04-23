import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'large' | 'xlarge';
    error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ variant = 'default', error = false, className = '', ...props }, ref) => {
        const baseClasses = 'w-full bg-white/5 border-2 rounded-2xl text-white text-center font-bold focus:outline-none transition-all duration-200 placeholder:text-white/20';

        const variantClasses = {
            default: 'px-6 py-4 text-lg border-white/10 focus:border-game-primary',
            large: 'px-6 py-5 text-2xl md:text-3xl rounded-2xl border-white/10 focus:border-game-secondary',
            xlarge: 'px-8 py-6 text-4xl md:text-5xl rounded-3xl border-white/10 focus:border-game-primary tracking-[0.3em]',
        };

        const focusClasses = 'focus:shadow-[0_0_30px_rgba(255,0,255,0.2)]';
        const errorClasses = error ? 'border-red-500 focus:border-red-500' : '';

        const classes = `${baseClasses} ${variantClasses[variant]} ${focusClasses} ${errorClasses} ${className}`;

        return <input ref={ref} className={classes} {...props} />;
    }
);

Input.displayName = 'Input';

export default Input;
