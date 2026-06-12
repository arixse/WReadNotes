"use client";

import { useState } from "react";

interface ApiKeyModalProps {
  onSubmit: (apiKey: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  onClearError?: () => void;
  /** 用户点击关闭/取消（首次使用时不传，更换 Key 时传入） */
  onClose?: () => void;
}

export default function ApiKeyModal({
  onSubmit,
  loading,
  error,
  onClearError,
  onClose,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    // 用户修改输入时清除旧错误提示
    if (error && onClearError) {
      onClearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 弹窗顶部渐变 */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400" />

        <div className="p-6 sm:p-8">
          {/* 关闭按钮（仅在可关闭时显示） */}
          {onClose && (
            <div className="flex justify-end -mt-1 -mr-1 mb-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
                aria-label="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              微信读书笔记
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              输入你的微信读书 API Key 以同步笔记数据
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="apikey"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                API Key
              </label>
              <input
                id="apikey"
                type="password"
                value={apiKey}
                onChange={handleInputChange}
                placeholder="wrk-xxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700
                  bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
                  transition-colors text-sm"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-amber-500 to-rose-500
                hover:from-amber-600 hover:to-rose-600
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all shadow-md shadow-amber-500/20"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  同步中...
                </span>
              ) : (
                "开始同步"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
              还没有 API Key？
              <br />
              <a
                href="https://weread.qq.com/r/weread-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                点击这里获取 →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
