
import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      
      <div className="p-5 flex flex-col flex-grow space-y-3">
        {/* Category tag skeleton */}
        <div className="h-3 w-16 bg-rose-50 rounded-md" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-stone-100 rounded-lg" />
          <div className="h-5 w-1/2 bg-stone-100 rounded-lg" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-1.5 pt-2">
          <div className="h-3 w-full bg-stone-50 rounded-md" />
          <div className="h-3 w-5/6 bg-stone-50 rounded-md" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
          <div className="space-y-1">
            <div className="h-6 w-16 bg-stone-100 rounded-md" />
            <div className="h-3 w-10 bg-stone-50 rounded-md" />
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {[...Array(8)].map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export default ProductSkeleton;
