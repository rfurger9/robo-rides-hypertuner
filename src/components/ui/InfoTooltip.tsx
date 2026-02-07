"use client";

import { useState } from "react";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className = "" }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {showTooltip && (
        <div className="absolute z-50 right-0 bottom-full mb-2 w-56 p-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg">
          {text}
          <div className="absolute right-2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

interface OutputRowProps {
  label: string;
  value: string | number;
  tooltip?: string;
  className?: string;
  valueClassName?: string;
}

export function OutputRow({ label, value, tooltip, className = "", valueClassName = "" }: OutputRowProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-slate-600 dark:text-slate-400 flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <span className={`font-semibold text-slate-900 dark:text-white ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
