
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, icon, footer }) => {
  return (
    <div className={`pro-card rounded-3xl flex flex-col h-full overflow-hidden group ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--card-bg)]">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all duration-300">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-heading)] truncate">{title}</h3>}
              {subtitle && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70 truncate">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-5 border-t border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-xl">
          {footer}
        </div>
      )}
    </div>
  );
};
