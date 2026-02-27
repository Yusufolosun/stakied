import React from 'react';

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    from?: string;
    to?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
    children,
    className = '',
    from = '#8B5CF6',
    to = '#06B6D4'
}) => {
    return (
        <span
            className={`inline-block text-transparent bg-clip-text font-display font-bold ${className}`}
            style={{
                backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}
        >
            {children}
        </span>
    );
};
