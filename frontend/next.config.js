/** @type {import('next').NextConfig} */
const isStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === '1';

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticDemo
    ? {
        output: 'export',
        basePath: '/consulence-mvp',
        images: { unoptimized: true },
      }
    : {
        experimental: { typedRoutes: true },
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://localhost:8000/:path*',
            },
          ];
        },
      }),
};

module.exports = nextConfig;
