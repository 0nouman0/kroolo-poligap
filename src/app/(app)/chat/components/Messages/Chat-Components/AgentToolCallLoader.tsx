import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AgentToolCallLoader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute bg-gray-600 rounded animate-pulse`}
            style={{
              width: size === 'sm' ? '2px' : size === 'md' ? '3px' : size === 'lg' ? '4px' : '5px',
              height: size === 'sm' ? '6px' : size === 'md' ? '8px' : size === 'lg' ? '12px' : '16px',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-${size === 'sm' ? '8px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '24px'})`,
              animationDelay: `${i * 0.08}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AgentToolCallLoader;