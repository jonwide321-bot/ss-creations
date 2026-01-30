
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <img 
      src="https://i.postimg.cc/zvs0wgqr/logo.jpg" 
      alt="SS Creations" 
      className={`${className} object-contain rounded-full`}
      onError={(e) => {
        // Fallback styling if image is missing
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default Logo;
