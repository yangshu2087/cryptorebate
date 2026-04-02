import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { getDiscoveryAssetRewrites } from "./src/lib/discovery-routes";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const workspaceRoot = path.resolve(process.cwd(), "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  async rewrites() {
    return getDiscoveryAssetRewrites();
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default withNextIntl(nextConfig);
