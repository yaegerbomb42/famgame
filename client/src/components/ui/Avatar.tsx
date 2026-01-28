import type { HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    emoji: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    selected?: boolean;
    clickable?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
    emoji,
    size = 'md',
    selected = false,
    clickable = false,
    className = '',
    ...props
}) => {
    const sizeClasses = {
        xs: 'w-8 h-8 text-lg',
        sm: 'w-12 h-12 text-2xl p-2',
        md: 'text-4xl p-3',
        lg: 'text-5xl p-4',
        xl: 'text-6xl p-5',
    };

    const baseClasses = 'rounded-2xl transition-all duration-200 center-flex';
    const clickableClasses = clickable
        ? 'cursor-pointer touch-target hover:scale-105 active:scale-95'
        : '';
    const selectedClasses = selected
        ? 'bg-yellow-400 scale-105 shadow-glow-magenta border-2 border-white'
        : 'bg-white/5 opacity-60 hover:opacity-100 border-2 border-transparent';

    const classes = `${baseClasses} ${sizeClasses[size]} ${clickableClasses} ${clickable ? selectedClasses : ''} ${className}`;

    return (
        <div className={classes} {...props}>
            {emoji}
        </div>
    );
};

export default Avatar;
