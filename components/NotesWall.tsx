"use client";

import type { Note } from "@/types";
import NoteCard from "./NoteCard";

interface NotesWallProps {
  notes: Note[];
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="break-inside-avoid mb-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse">
      <div className="h-1 bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-9 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
            <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function NotesWall({ notes, loading }: NotesWallProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="text-lg font-medium">暂无笔记</p>
        <p className="text-sm mt-1">请确认已输入正确的 API Key</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
