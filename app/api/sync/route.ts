import { NextRequest, NextResponse } from "next/server";
import { fetchAllNotesServerSide, WEREAD_GATEWAY } from "@/lib/weread";

const SKILL_VERSION = "1.0.5";

/** 服务端直连网关验证 API key */
async function validateKeyServerSide(apiKey: string): Promise<void> {
  const res = await fetch(WEREAD_GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      api_name: "/user/notebooks",
      skill_version: SKILL_VERSION,
      count: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`API Key 验证失败: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.errcode != null && data.errcode !== 0) {
    throw new Error(data.errmsg || `API Key 无效 (errcode=${data.errcode})`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = body?.apiKey;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "请提供有效的 API Key" },
        { status: 400 }
      );
    }

    // 1. 先验证 key（服务端直连，无跨域问题）
    try {
      await validateKeyServerSide(apiKey);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "API Key 验证失败" },
        { status: 401 }
      );
    }

    // 2. 拉取全部笔记：分页循环 + 按书批量并发，全在服务端完成
    const notes = await fetchAllNotesServerSide(apiKey);

    return NextResponse.json({ notes });
  } catch (err) {
    console.error("/api/sync 错误:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "同步失败" },
      { status: 500 }
    );
  }
}
