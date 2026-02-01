import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", variant = 'dark' }) => {
  return (
    <img 
      src="https://i.postimg.cc/zvs0wgqr/logo.jpg" 
      alt="SS Creations Logo" 
      className={`${className} object-contain rounded-full ${variant === 'light' ? 'brightness-110' : ''}`}
      width="48"
      height="48"
      loading="eager"
      decoding="async"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default Logo;