import { useState } from "react";

const LazyImage = ({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder skeleton */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${placeholderClassName}`}
        />
      )}

      {/* Actual image */}
      <img
        src={hasError ? "/placeholder.jpg" : src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
