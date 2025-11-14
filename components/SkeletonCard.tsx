import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
      <div className="relative aspect-[4/3] bg-neutral-200">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-6 bg-neutral-200 rounded-lg w-3/4"></div>
        
        {/* Description skeleton */}
        <div className="h-4 bg-neutral-200 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
          <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
          <div className="h-6 bg-neutral-200 rounded-full w-24"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-5 bg-neutral-200 rounded w-12"></div>
          <div className="h-4 bg-neutral-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

