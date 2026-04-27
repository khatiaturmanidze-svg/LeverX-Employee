import React, { useState } from 'react';

interface LazyImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'loading'
> {
  skeletonClassName?: string;
}

export default function LazyImage({
  className = '',
  skeletonClassName = '',
  alt,
  onLoad,
  onError,
  ...props
}: LazyImageProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    setHasError(true);
    onError?.(event);
  };

  const fallbackLabel = props['aria-label'] ?? alt ?? 'Image failed to load';

  return (
    <span
      className={`lazy-image ${isLoaded ? 'lazy-image--loaded' : ''} ${
        hasError ? 'lazy-image--error' : ''
      } ${skeletonClassName}`.trim()}
    >
      {hasError ? (
        <span
          className={`${className} lazy-image__fallback`.trim()}
          role="img"
          aria-label={fallbackLabel}
        >
          {fallbackLabel}
        </span>
      ) : (
        <img
          {...props}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </span>
  );
}
