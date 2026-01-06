"use client";

import { useEffect, useState } from "react";

type Props = {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

export function FlavorIconPreview({
  src,
  alt,
  className = "",
  fallbackClassName = "",
}: Props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <div className={fallbackClassName} />;
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
}
