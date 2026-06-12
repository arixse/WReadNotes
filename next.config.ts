import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 关闭 StrictMode 避免 useEffect 在开发模式下双重执行
  // 该行为会导致 IndexedDB 和 API 请求并发竞态
  reactStrictMode: false,

  // 代理 API 请求到微信读书网关，解决跨域问题
  async rewrites() {
    return [
      {
        source: "/api/gateway",
        destination: "https://i.weread.qq.com/api/agent/gateway",
      },
    ];
  },
};

export default nextConfig;
