export default function Loading() {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="relative flex flex-col items-center gap-4">
          {/* Radar Animation */}
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-red-500 animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-red-500/10 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]"></div>
          </div>
  
          {/* Text */}
          <div className="flex flex-col items-center">
              <h2 className="text-xl font-black text-white tracking-[0.2em] animate-pulse">
                  ACCESSING SECURE SERVER
              </h2>
              <p className="text-xs font-mono text-red-500/70 mt-1">
                  Authenticating Credentials...
              </p>
          </div>
  
          {/* Progress Bar */}
          <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-red-600 animate-[loading_1s_ease-in-out_infinite] w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }