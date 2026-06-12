"use client";

import type { Note } from "@/types";
import { useMemo } from "react";

// 卡片的强调色（用于顶部渐变条、背景色、边框色）
// 注意：渐变类名和背景类名作为完整的字符串字面量存在于源码中，
// Tailwind 可以扫描到，可以安全地通过数组索引引用。
// 但 border-l-xxx 是动态拼接的，必须用 inline style。
const ACCENT_COLORS = [
  { gradient: "from-amber-400 to-orange-400", border: "#fbbf24", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { gradient: "from-emerald-400 to-teal-400", border: "#34d399", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { gradient: "from-sky-400 to-blue-400", border: "#38bdf8", bg: "bg-sky-50 dark:bg-sky-950/30" },
  { gradient: "from-rose-400 to-pink-400", border: "#fb7185", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { gradient: "from-violet-400 to-purple-400", border: "#a78bfa", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { gradient: "from-cyan-400 to-sky-400", border: "#22d3ee", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  { gradient: "from-fuchsia-400 to-rose-400", border: "#e879f9", bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30" },
  { gradient: "from-lime-400 to-green-400", border: "#a3e635", bg: "bg-lime-50 dark:bg-lime-950/30" },
];

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NoteCard({ note }: { note: Note }) {
  // 基于笔记 id 确定性地选颜色
  const accent = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < note.id.length; i++) {
      hash = (hash * 31 + note.id.charCodeAt(i)) | 0;
    }
    return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
  }, [note.id]);

  const isHighlight = note.noteType === "highlight";

  return (
    <div className="break-inside-avoid mb-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* 顶部色条 — 使用 Tailwind gradient（来源码中是完整类名） */}
      <div className={`h-1 bg-gradient-to-r ${accent.gradient}`} />

      <div className="p-4">
        {/* 书籍信息 */}
        <div className="flex items-center gap-2 mb-3">
          {note.bookCover ? (
            <img
              src={note.bookCover}
              alt={note.bookTitle}
              className="w-7 h-9 rounded object-cover shrink-0"
              loading="lazy"
            />
          ) : (
            <div
              className="w-7 h-9 rounded shrink-0 flex items-center justify-center text-xs"
              style={{ backgroundColor: accent.border + "20" }}
            >
              📖
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
              {note.bookTitle}
            </p>
            {note.chapterName ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                {note.chapterName}
              </p>
            ) : null}
          </div>
        </div>

        {/* 笔记内容 */}
        <div className="relative">
          {isHighlight ? (
            // 划线：引用风格，用 inline style 设置左侧边框颜色
            <blockquote
              className="border-l-2 pl-3"
              style={{ borderLeftColor: accent.border }}
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {note.text}
              </p>
            </blockquote>
          ) : (
            // 想法/点评：气泡风格，用 Tailwind 背景类（来源码中是完整类名）
            <div className={`rounded-xl p-3 ${accent.bg}`}>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {note.text}
              </p>
            </div>
          )}
        </div>

        {/* 底部标签 + 时间 */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              isHighlight
                ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"
                : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
            }`}
          >
            {isHighlight ? "划线" : "想法"}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatTime(note.createTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
