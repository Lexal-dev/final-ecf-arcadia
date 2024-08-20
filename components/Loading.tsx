
import React, { ReactNode } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface LoadingProps {
  loading: boolean;
  children: ReactNode;
}

const Loading: React.FC<LoadingProps> = ({ loading, children }) => {

  return loading ? (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <FaSpinner className="text-5xl text-white animate-spin" />
    </div>
  ) : (
    <>{children}</>
  );
};

export default Loading;