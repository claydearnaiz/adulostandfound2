import React, { useState, useRef, useEffect, useCallback } from 'react';

export const LazyImage = ({ src, alt, className = '', ...props }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    // Check if already loaded (for cached images)
    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        if (img.naturalWidth > 0) {
          setStatus('loaded');
        } else {
          // Image complete but no width means error
          setStatus('error');
        }
      }
    }
  }, [src]);

  const handleLoad = useCallback(() => {
    setStatus('loaded');
  }, []);

  const handleError = useCallback(() => {
    setStatus('error');
  }, []);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`} style={{ minHeight: '100px' }}>
      {/* Always render the img if we have a src */}
      {src && status !== 'error' && (
        <img
          ref={imgRef}
          src={src}
          alt={alt || 'Image'}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: status === 'loaded' ? 1 : 0,
            transition: 'opacity 0.2s ease-out'
          }}
          {...props}
        />
      )}
      
      {/* Loading Skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
      )}

      {/* Error / No Image Placeholder */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4">
          <svg 
            className="w-10 h-10 opacity-30 mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-semibold text-slate-400">No Image</span>
        </div>
      )}
    </div>
  );
};
