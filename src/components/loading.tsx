export const LoadingSpinner = () => {
  return (
    <span className="loading loading-spinner text-red-700"></span>
  );
};

export const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center mt-6">
      <LoadingSpinner/>
    </div>
  );
};
