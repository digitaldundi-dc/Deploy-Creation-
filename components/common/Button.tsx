
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'shimmer';
  isLoading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2.5 font-extrabold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.92] tracking-tight rounded-[22px] border overflow-hidden relative group";
  
  const sizes = {
    sm: "px-6 py-3 text-[11px] uppercase tracking-wider",
    md: "px-8 py-4 text-xs uppercase tracking-widest",
    lg: "px-14 py-6 text-sm uppercase tracking-[0.2em]"
  };

  const variants = {
    primary: "bg-[#6366F1] border-[#6366F1] text-white hover:bg-[#4F46E5] shadow-2xl shadow-indigo-500/30",
    secondary: "bg-[#1A1C1E] dark:bg-white dark:text-black text-white hover:opacity-95 border-transparent",
    outline: "bg-transparent border-[var(--border-color)] text-[var(--text-heading)] hover:border-indigo-600 hover:text-indigo-600 hover:bg-white",
    ghost: "border-transparent text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-[var(--text-heading)]",
    glass: "bg-white/10 backdrop-blur-2xl border-white/20 text-[var(--text-heading)] hover:bg-white/20",
    shimmer: "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white border-transparent hover:shadow-indigo-500/40 bg-[length:200%_auto] hover:bg-[100%_center] transition-[background-position] duration-700"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className="shrink-0 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">{icon}</span>}
          <span className="relative z-10">{children}</span>
        </>
      )}
    </button>
  );
};
