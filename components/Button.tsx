import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: "bg-morandi-primary text-white hover:bg-stone-600 shadow-md shadow-stone-200",
    secondary: "bg-morandi-sage text-stone-800 hover:brightness-95",
    ghost: "bg-transparent text-morandi-text hover:bg-morandi-surface",
    outline: "border-2 border-morandi-accent text-morandi-text hover:bg-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
