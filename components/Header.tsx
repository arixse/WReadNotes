"use client";

interface HeaderProps {
  onRefresh: () => void;
  onChangeApiKey: () => void;
  refreshing: boolean;
  noteCount: number;
}

export default function Header({
  onRefresh,
  onChangeApiKey,
  refreshing,
  noteCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            📚 微信读书笔记
          </h1>
          {noteCount > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              共 {noteCount} 条笔记
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300
              hover:bg-zinc-200 dark:hover:bg-zinc-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">换一批</span>
          </button>

          <button
            onClick={onChangeApiKey}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400
              hover:bg-zinc-200 dark:hover:bg-zinc-700
              transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="hidden sm:inline">更换 Key</span>
          </button>
        </div>
      </div>
    </header>
  );
}
