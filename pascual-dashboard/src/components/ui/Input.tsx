"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2
            bg-zinc-900 border border-zinc-800 rounded-sm
            text-white font-mono text-sm
            placeholder:text-zinc-600
            focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_10px_rgba(0,217,255,0.2)]
            transition-all duration-200
            ${error ? "border-[#ff006e]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-mono text-[#ff006e]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2
            bg-zinc-900 border border-zinc-800 rounded-sm
            text-white font-mono text-sm
            placeholder:text-zinc-600
            focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_10px_rgba(0,217,255,0.2)]
            transition-all duration-200
            resize-none
            ${error ? "border-[#ff006e]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-mono text-[#ff006e]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  compact?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, compact = false, className = "", ...props }, ref) => {
    const sizeClasses = compact
      ? "px-2 py-1 text-xs"
      : "px-3 py-2 text-sm";

    return (
      <div className={className}>
        {label && (
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full ${sizeClasses}
            bg-zinc-900 border border-zinc-800 rounded-sm
            text-white font-mono
            focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_10px_rgba(0,217,255,0.2)]
            transition-all duration-200
            cursor-pointer
            ${error ? "border-[#ff006e]" : ""}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs font-mono text-[#ff006e]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
