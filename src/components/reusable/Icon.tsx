import React from 'react';

interface IconProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function Icon({
  src,
  alt,
  width,
  height,
  className,
}: IconProps) {
  return (
    <img src={src} alt={alt} width={width} height={height} className={className} />
  );
}

