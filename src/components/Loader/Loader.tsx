import React from 'react';

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 z-50 h-[100vh] w-[100vw] flex items-center justify-center bg-black bg-opacity-50">
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;