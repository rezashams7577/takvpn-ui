import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const apiInternal = process.env.API_INTERNAL_URL || "http://127.0.0.1:8080";
const rootDir = path.join(process.cwd(), "..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: rootDir,
  transpilePackages: ["@takvpn/shared"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternal}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
