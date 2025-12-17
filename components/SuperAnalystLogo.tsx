import React from 'react';

interface SuperAnalystLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export default function SuperAnalystLogo({ 
  size = 'md', 
  showSubtitle = false, 
  className = '' 
}: SuperAnalystLogoProps) {
  const sizeClasses = {
    sm: 'w-32 h-8',
    md: 'w-40 h-10', 
    lg: 'w-48 h-12',
    xl: 'w-56 h-14'
  };

  const iconSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
    xl: { width: 48, height: 48 }
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  const currentSize = sizeClasses[size];
  const iconSize = iconSizes[size];
  const textSize = textSizes[size];

  return (
    <div className={`flex items-center space-x-3 ${currentSize} ${className}`}>
      {/* Magnifying Glass Icon with Data Analysis Graphics */}
      <div className="flex-shrink-0">
        <svg 
          width={iconSize.width} 
          height={iconSize.height} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          {/* Magnifying Glass Circle */}
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
          />
          
          {/* Data Analysis Graphics Inside Circle */}
          {/* Bar Chart */}
          <rect x="6" y="16" width="2" height="4" fill="currentColor" />
          <rect x="9" y="14" width="2" height="6" fill="currentColor" />
          <rect x="12" y="12" width="2" height="8" fill="currentColor" />
          
          {/* Upward Trending Line */}
          <path 
            d="M6 18 L9 15 L12 10 L15 7" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Arrow pointing up-right */}
          <path 
            d="M13 5 L15 7 L13 9" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Magnifying Glass Handle */}
          <path 
            d="M20 20 L26 26" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex-shrink-0">
        <div className={`font-bold text-white ${textSize} leading-tight`}>
          SuperAnalyst
        </div>
        {showSubtitle && (
          <div className="text-xs text-gray-300 leading-tight">
            Pro Equity Research
          </div>
        )}
      </div>
    </div>
  );
}
