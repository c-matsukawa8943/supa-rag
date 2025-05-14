import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // ボディサイズ制限を10MBに設定
    }
  }
};

export default nextConfig;
