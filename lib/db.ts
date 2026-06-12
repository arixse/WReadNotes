import type { Note, StoredData } from "@/types";

const DB_NAME = "wread_notes";
const DB_VERSION = 1;
const STORE_NAME = "data";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onblocked = () => {
      // 另一个标签页持有了旧版本数据库连接，阻止升级
      // 关闭当前请求让用户刷新页面重试
      console.warn("IndexedDB 升级被阻塞，请关闭其他标签页后刷新页面");
      reject(new Error("数据库升级被阻塞，请关闭其他标签页后刷新"));
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getStore(mode: IDBTransactionMode = "readonly") {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  // 监听事务级错误，避免静默失败
  tx.onerror = () => {
    console.error("IndexedDB 事务失败:", tx.error);
  };
  return tx.objectStore(STORE_NAME);
}

// 保存整份数据（覆盖写）
export async function saveData(data: StoredData): Promise<void> {
  const store = await getStore("readwrite");
  return new Promise((resolve, reject) => {
    const request = store.put(data, "main");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// 读取整份数据
export async function loadData(): Promise<StoredData | null> {
  const store = await getStore("readonly");
  return new Promise((resolve, reject) => {
    const request = store.get("main");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

// 获取保存的 API key
export async function getApiKey(): Promise<string | null> {
  const data = await loadData();
  return data?.apiKey ?? null;
}

// 获取保存的笔记
export async function getNotes(): Promise<Note[]> {
  const data = await loadData();
  return data?.notes ?? [];
}

// 清除所有数据
export async function clearData(): Promise<void> {
  const store = await getStore("readwrite");
  return new Promise((resolve, reject) => {
    const request = store.delete("main");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
