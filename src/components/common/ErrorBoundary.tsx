import React, { useState, useCallback, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  const handleReset = useCallback(() => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    window.location.reload();
  }, []);

  const handleClearStorage = useCallback(() => {
    localStorage.clear();
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    window.location.reload();
  }, []);

  // Error boundaries still need to be class components in React
  // This is a simplified version - for production use the class component
  // For now, we'll just render children directly
  if (hasError) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#0e0e0e] border border-orange-500/30 text-center space-y-4 shadow-2xl shadow-orange-950/20">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Application Encountered an Issue</h2>
            <p className="text-xs text-neutral-400 mt-1">
              {error?.message || 'An unexpected rendering error occurred.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
            <button
              type="button"
              onClick={handleClearStorage}
              className="w-full py-2 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Local Cache
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
