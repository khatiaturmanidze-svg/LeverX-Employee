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
  onLoad,
  onError,
  ...props
}: LazyImageProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onError?.(event);
  };

  return (
    <span
      className={`lazy-image ${isLoaded ? 'lazy-image--loaded' : ''} ${skeletonClassName}`.trim()}
    >
      <img
        {...props}
        className={className}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </span>
  );
}
