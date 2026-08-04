import React from 'react';

export function SectionSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 mb-10 mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
        ))}
      </div>
    </div>
  );
}
