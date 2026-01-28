interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'white';
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    text,
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 border-2',
        md: 'w-16 h-16 border-4',
        lg: 'w-24 h-24 border-4',
    };

    const colorClasses = {
        primary: 'border-white/10 border-t-game-primary',
        secondary: 'border-white/10 border-t-game-secondary',
        white: 'border-white/10 border-t-white',
    };

    return (
        <div className="center-flex flex-col gap-4">
            <div className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
            {text && (
                <p className="text-white/50 text-sm font-mono uppercase tracking-widest">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
