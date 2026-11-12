import React from 'react';

export default function PageContainer({
  title,
  subtitle,
  actions,
  children
}) {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-left">
      {/* Page Title & Actions Header */}
      {(title || subtitle || actions) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5">{actions}</div>}
        </div>
      )}

      {/* Main Page Content */}
      <div>{children}</div>
    </div>
  );
}
