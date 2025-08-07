"use client";

interface LoadingSpinnerProps {
  fullPage?: boolean;
}

export const LoadingSpinner = ({ fullPage = false }: LoadingSpinnerProps) => {
  if (fullPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
    </div>
  );
};



