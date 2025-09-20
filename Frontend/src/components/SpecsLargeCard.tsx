import React from 'react';
import { CPUInfo } from '../types';

interface SpecsCardProps {
  icon: React.ReactNode;
  field: string;
  value: string | number | CPUInfo;
}

// Component that displays an individual large specification card (for the Specs page)
const SpecsLargeCard: React.FC<SpecsCardProps> = ({ icon, field, value }) => {
  return (
    <div className='flex flex-col items-center gap-4 bg-white dark:bg-color-background-dark-third shadow-md rounded-lg px-4 py-2 border border-gray-200 dark:border-color-background-dark-third'>
      <div className='text-blue-500 text-6xl bg-color-fourth dark:bg-color-second rounded-full p-3'>
        {icon}
      </div>
      <p className='dark:text-color-text-dark text-color-text-dark text-2xl my-2 bg-color-first dark:bg-color-background-dark rounded w-full flex justify-center '>
        {field}
      </p>
      {typeof value === 'object' ? (
        <div className='flex flex-col items-start gap-1'>
          <p className='text-gray-600 text-sm font-semibold'>
            model: {value.model}
          </p>
          <p className='text-gray-600 text-sm font-semibold'>
            architecture: {value.architecture}
          </p>
          <p className='text-gray-600 text-sm font-semibold'>
            cores: {value.cores}
          </p>
          <p className='text-gray-600 text-sm font-semibold'>
            l1 cache (KB): {value.l1_cache_kb}
          </p>
          <p className='text-gray-600 text-sm font-semibold'>
            l2 cache (KB): {value.l2_cache_kb}
          </p>
          <p className='text-gray-600 text-sm font-semibold'>
            l3 cache (KB): {value.l3_cache_kb}
          </p>
        </div>
      ) : (
        <div className='flex flex-col items-start gap-1'>
          <p className='text-gray-600 text-sm font-semibold '>
            {value}
            <br />
          </p>
        </div>
      )}
    </div>
  );
};

export default SpecsLargeCard;
