import type {
  Note,
  NotebookEntry,
  NotebooksResponse,
  BookmarkListResponse,
  ReviewListMineResponse,
} from "@/types";

// 浏览器端走 Next.js rewrites 代理（同源，无跨域）
const CLIENT_GATEWAY = "/api/gateway";
// 服务端直连微信读书网关（无跨域限制，无需代理）
export const WEREAD_GATEWAY = "https://i.weread.qq.com/api/agent/gateway";
const SKILL_VERSION = "1.0.5";

interface GatewayCall {
  api_name: string;
  skill_version: string;
  [key: string]: unknown;
}

async function callGateway<T>(
  apiKey: string,
  params: GatewayCall,
  gatewayUrl: string
): Promise<T> {
  const res = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    // 尝试从响应体中读取详细错误信息
    let detail = "";
    try {
      const body = await res.json();
      if (body?.errmsg) detail = `: ${body.errmsg}`;
      else if (body?.message) detail = `: ${body.message}`;
    } catch {
      // 响应体无法解析为 JSON，忽略
    }
    throw new Error(`API 请求失败: HTTP ${res.status}${detail}`);
  }

  const data = (await res.json()) as T & { errcode?: number; errmsg?: string };
  // errcode 为 undefined 或 0 表示成功，其他值表示错误
  if (data.errcode != null && data.errcode !== 0) {
    throw new Error(
      `API 错误: ${(data as { errmsg?: string }).errmsg || `errcode=${data.errcode}`}`
    );
  }

  return data;
}

// 拉取所有有笔记的书（分页循环）
async function fetchAllNotebooks(
  apiKey: string,
  gatewayUrl: string
): Promise<NotebookEntry[]> {
  const allBooks: NotebookEntry[] = [];
  let lastSort: number | undefined;
  const PAGE_SIZE = 50;
  let pageCount = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    pageCount++;
    // 安全阀：最多请求 20 页，防止意外无限循环
    if (pageCount > 20) {
      console.warn("fetchAllNotebooks: 达到最大页数限制，停止分页");
      break;
    }

    const params: GatewayCall = {
      api_name: "/user/notebooks",
      skill_version: SKILL_VERSION,
      count: PAGE_SIZE,
    };
    if (lastSort !== undefined) {
      params.lastSort = lastSort;
    }

    const res = await callGateway<NotebooksResponse>(apiKey, params, gatewayUrl);
    if (!res.books || res.books.length === 0) break;

    allBooks.push(...res.books);
    lastSort = res.books[res.books.length - 1].sort;

    // 本页不足一页说明已到末尾
    if (res.books.length < PAGE_SIZE) break;
  }

  return allBooks;
}

// 拉取单本书的划线
async function fetchBookmarks(
  apiKey: string,
  bookId: string,
  gatewayUrl: string
): Promise<BookmarkListResponse> {
  return callGateway<BookmarkListResponse>(
    apiKey,
    {
      api_name: "/book/bookmarklist",
      skill_version: SKILL_VERSION,
      bookId,
    },
    gatewayUrl
  );
}

// 拉取单本书的想法/点评
async function fetchReviews(
  apiKey: string,
  bookId: string,
  gatewayUrl: string
): Promise<ReviewListMineResponse> {
  return callGateway<ReviewListMineResponse>(
    apiKey,
    {
      api_name: "/review/list/mine",
      skill_version: SKILL_VERSION,
      bookid: bookId,
      count: 200,
    },
    gatewayUrl
  );
}

// 将章节 UID 映射到章节名
function chapterUidToName(
  chapters: Array<{ chapterUid: number; title: string }>,
  chapterUid: number
): string {
  const ch = chapters.find((c) => c.chapterUid === chapterUid);
  return ch?.title ?? "";
}

// 主函数：拉取所有笔记（内部实现，接受 gatewayUrl）
async function fetchAllNotesInternal(
  apiKey: string,
  gatewayUrl: string
): Promise<Note[]> {
  const notebooks = await fetchAllNotebooks(apiKey, gatewayUrl);
  if (notebooks.length === 0) return [];

  const allNotes: Note[] = [];

  // 分批并发，每批最多 5 本
  const BATCH_SIZE = 5;
  for (let i = 0; i < notebooks.length; i += BATCH_SIZE) {
    const batch = notebooks.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (entry) => {
        const [bookmarksRes, reviewsRes] = await Promise.allSettled([
          fetchBookmarks(apiKey, entry.bookId, gatewayUrl),
          fetchReviews(apiKey, entry.bookId, gatewayUrl),
        ]);

        const notes: Note[] = [];
        const bookTitle = entry.book?.title ?? "未知书名";
        const bookAuthor = entry.book?.author ?? "未知作者";
        const bookCover = entry.book?.cover ?? "";

        // 处理划线
        if (bookmarksRes.status === "fulfilled" && bookmarksRes.value?.updated) {
          for (const bm of bookmarksRes.value.updated) {
            const chapterName =
              chapterUidToName(
                bookmarksRes.value.chapters ?? [],
                bm.chapterUid
              ) || "未知章节";
            notes.push({
              id: `hl-${bm.bookmarkId}`,
              bookId: entry.bookId,
              bookTitle,
              bookAuthor,
              bookCover,
              chapterName,
              text: bm.markText,
              noteType: "highlight" as const,
              createTime: bm.createTime,
            });
          }
        }

        // 处理想法/点评
        if (reviewsRes.status === "fulfilled" && reviewsRes.value?.reviews) {
          for (const r of reviewsRes.value.reviews) {
            if (!r.review?.content) continue;
            notes.push({
              id: `rv-${r.review.reviewId}`,
              bookId: entry.bookId,
              bookTitle,
              bookAuthor,
              bookCover,
              chapterName: r.review.chapterName ?? "",
              text: r.review.content,
              noteType: "thought" as const,
              createTime: r.review.createTime,
            });
          }
        }

        return notes;
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        allNotes.push(...r.value);
      }
    }
  }

  return allNotes;
}

// 浏览器端：通过 /api/sync 服务端路由拉取（推荐，1 次请求）
// 直接调用的兜底（走 /api/gateway 代理）
export async function fetchAllNotes(apiKey: string): Promise<Note[]> {
  return fetchAllNotesInternal(apiKey, CLIENT_GATEWAY);
}

// 服务端：直连微信读书网关拉取所有笔记
export async function fetchAllNotesServerSide(apiKey: string): Promise<Note[]> {
  return fetchAllNotesInternal(apiKey, WEREAD_GATEWAY);
}

// 验证 API key 是否有效（快速测试调用）
// 成功返回 true，失败抛出带详细信息的 Error
// 浏览器端走代理，避免跨域
export async function validateApiKey(apiKey: string): Promise<true> {
  await callGateway<NotebooksResponse>(
    apiKey,
    {
      api_name: "/user/notebooks",
      skill_version: SKILL_VERSION,
      count: 1,
    },
    CLIENT_GATEWAY
  );
  return true;
}
