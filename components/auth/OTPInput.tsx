'use client';

import { useRef, useState, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export default function OTPInput({ value, onChange, error, disabled }: OTPInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Auto-focus on mount
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(newValue);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pastedData);
  };

  const handleClick = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  };

  // Render 6 boxes
  const boxes = [];
  for (let i = 0; i < 6; i++) {
    const digit = value[i] || '';
    const isFilled = digit !== '';
    const showCursor = isFocused && i === value.length && !disabled;

    boxes.push(
      <div
        key={i}
        className={`
          relative w-12 h-14 flex items-center justify-center text-2xl font-semibold rounded-lg border-2 transition-all duration-200 backdrop-blur-sm
          ${isFilled
            ? error
              ? 'border-destructive bg-destructive/10 text-destructive'
              : 'border-primary bg-primary/10 text-white'
            : error
              ? 'border-destructive/50 bg-background/30'
              : 'border-foreground/20 bg-background/30 text-foreground'
          }
          ${isFocused && i === value.length && !error ? 'border-primary ring-2 ring-primary/30' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
        `}
        onClick={handleClick}
      >
        {digit}
        {showCursor && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0.5 h-8 bg-primary animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Visual boxes */}
      <div className="flex gap-2 justify-center mb-2">
        {boxes}
      </div>

      {/* Hidden input for actual input capture */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        autoComplete="one-time-code"
        className="absolute opacity-0 pointer-events-none"
        aria-label="One-time password"
      />
    </div>
  );
}
