/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Images are resized in the browser before upload, so 4 MB is plenty.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
