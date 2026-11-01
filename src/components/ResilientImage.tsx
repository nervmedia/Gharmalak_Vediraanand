import React, { useState } from 'react';
import { Home } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackLabel?: string;
  containerClassName?: string;
}

export function ResilientImage({
  src,
  alt,
  fallbackLabel,
  containerClassName = '',
  className = '',
  loading = 'lazy',
  ...rest
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#064E3B] to-[#073B30] text-white/90 p-4 text-center ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <Home className="w-8 h-8 text-[#FFC928] mb-2 opacity-90" />
        <span className="text-xs font-medium tracking-wide max-w-[18ch] line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
