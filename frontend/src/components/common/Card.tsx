import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  variant = 'glass',
  interactive = true
}) => {
  const baseStyles = 'relative rounded-3xl overflow-hidden transition-all duration-300 animate-reveal';

  const variants = {
    glass: 'glass-panel',
    solid: 'bg-color-bg-card border border-border-glass',
  };

  const interactiveClass = interactive ? 'glass-panel-hover hover-glow' : '';

  return (
    <div className={`${baseStyles} ${variants[variant]} ${interactiveClass} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-xl font-display font-semibold text-main mb-0">{title}</h3>
        </div>
      )}
      <div className="px-6 py-6 card-content">
        {children}
      </div>

      {/* Subtle background glow effect if glass */}
      {variant === 'glass' && (
        <div className="absolute inset-0 pointer-events-none bg-grad-surface opacity-50" />
      )}
    </div>
  );
};
