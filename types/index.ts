// 笔记来源类型
export type NoteType = "highlight" | "thought";

// 单条笔记
export interface Note {
  id: string; // 唯一标识
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  chapterName?: string;
  text: string; // 笔记正文
  noteType: NoteType;
  createTime: number; // Unix 时间戳（秒）
}

// /user/notebooks 返回的单本书
export interface NotebookEntry {
  bookId: string;
  sort: number;
  reviewCount: number;
  noteCount: number;
  bookmarkCount: number;
  book: {
    title: string;
    author: string;
    cover: string;
  };
}

// /user/notebooks 回包
export interface NotebooksResponse {
  errcode: number;
  totalBookCount: number;
  totalNoteCount: number;
  hasMore: number;
  books: NotebookEntry[];
}

// /book/bookmarklist 回包（已过滤 type=0）
export interface BookmarkListResponse {
  errcode: number;
  updated: Array<{
    bookmarkId: string;
    bookId: string;
    chapterUid: number;
    markText: string;
    createTime: number;
    range: string;
  }>;
  chapters: Array<{
    chapterUid: number;
    chapterIdx: number;
    title: string;
  }>;
  book: {
    title: string;
    author: string;
    cover: string;
  };
}

// /review/list/mine 回包
export interface ReviewListMineResponse {
  errcode: number;
  totalCount: number;
  hasMore: number;
  synckey: number;
  reviews: Array<{
    review: {
      reviewId: string;
      content: string;
      createTime: number;
      chapterName?: string;
      chapterUid?: number;
      range?: string;
    };
  }>;
}

// IndexedDB 存储结构
export interface StoredData {
  apiKey: string;
  notes: Note[];
  lastFetchTime: number;
}
