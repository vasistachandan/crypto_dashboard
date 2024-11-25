import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="p-4 border rounded-lg shadow-sm animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 dark:bg-gray-700"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
