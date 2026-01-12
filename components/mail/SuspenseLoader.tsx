'use client';

import { CircularProgress } from '@mui/material';

const SuspenseLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <CircularProgress />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );
};

export default SuspenseLoader;


