"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import NotesWall from "@/components/NotesWall";
import ApiKeyModal from "@/components/ApiKeyModal";
import { loadData, saveData } from "@/lib/db";
import type { Note } from "@/types";

// Fisher-Yates 洗牌
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 随机取 N 条
function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/**
 * 调用服务端 /api/sync，由后端统一处理验证 + 分页拉取
 * 浏览器只发 1 次 HTTP 请求，后端完成所有网关调用后一次性返回
 */
async function syncNotes(apiKey: string): Promise<Note[]> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `同步失败: HTTP ${res.status}`);
  }

  return data.notes as Note[];
}

export default function HomeClient() {
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [displayNotes, setDisplayNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // 初始化：从 IndexedDB 加载
  useEffect(() => {
    let aborted = false;

    const init = async () => {
      try {
        const data = await loadData();
        if (aborted) return;

        if (data?.apiKey && data.notes && data.notes.length > 0) {
          setApiKey(data.apiKey);
          setAllNotes(data.notes);
          setDisplayNotes(pickRandom(data.notes, 50));
        } else if (data?.apiKey) {
          // 有 key 但没有笔记，自动化拉取
          setApiKey(data.apiKey);
          setShowModal(false);
          await fetchAndSave(data.apiKey);
        } else {
          // 没有 key，显示弹窗
          setShowModal(true);
        }
      } catch (err) {
        if (aborted) return;
        console.error("初始化失败:", err);
        setModalError(
          err instanceof Error ? err.message : "初始化失败，请重试"
        );
        setShowModal(true);
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    };
    init();

    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 拉取笔记并保存（通过 /api/sync，1 次请求完成验证+拉取）
  const fetchAndSave = useCallback(async (key: string) => {
    setFetchingNotes(true);
    try {
      const notes = await syncNotes(key);
      // 先持久化到 IndexedDB，成功后再更新 UI 状态
      await saveData({
        apiKey: key,
        notes,
        lastFetchTime: Date.now(),
      });
      setAllNotes(notes);
      setDisplayNotes(pickRandom(notes, 50));
      setApiKey(key);
      setShowModal(false);
      setModalError(null);
    } catch (err) {
      console.error("拉取笔记失败:", err);
      throw err;
    } finally {
      setFetchingNotes(false);
    }
  }, []);

  // 提交 API Key（/api/sync 已内置验证，无需单独调 validateApiKey）
  const handleSubmitApiKey = useCallback(
    async (key: string) => {
      setModalLoading(true);
      setModalError(null);
      try {
        await fetchAndSave(key);
      } catch (err) {
        setModalError(
          err instanceof Error
            ? err.message
            : "同步失败，请检查 API Key 或网络连接"
        );
      } finally {
        setModalLoading(false);
      }
    },
    [fetchAndSave]
  );

  // 刷新：重新随机选取 50 条
  const handleRefresh = useCallback(() => {
    if (allNotes.length > 0) {
      setDisplayNotes(pickRandom(allNotes, 50));
    }
  }, [allNotes]);

  // 更换 API Key：只弹窗，不提前清数据
  // 新旧数据切换逻辑：用户提交新 key → sync 成功 → saveData 覆盖 IndexedDB → UI 更新
  // 如果用户关闭弹窗或刷新页面，旧数据仍然在 IndexedDB 中，不会丢失
  const handleChangeApiKey = useCallback(() => {
    setModalError(null);
    setShowModal(true);
  }, []);

  // 关闭弹窗（保留现有数据不变）
  const handleCloseModal = useCallback(() => {
    // 首次使用（无数据）时不允许关闭，必须输入 key
    if (!apiKey) return;
    setShowModal(false);
    setModalError(null);
  }, [apiKey]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {apiKey && (
        <Header
          onRefresh={handleRefresh}
          onChangeApiKey={handleChangeApiKey}
          refreshing={fetchingNotes}
          noteCount={allNotes.length}
        />
      )}

      <NotesWall notes={displayNotes} loading={loading || fetchingNotes} />

      {showModal && (
        <ApiKeyModal
          onSubmit={handleSubmitApiKey}
          loading={modalLoading}
          error={modalError}
          onClearError={() => setModalError(null)}
          onClose={apiKey ? handleCloseModal : undefined}
        />
      )}
    </div>
  );
}
