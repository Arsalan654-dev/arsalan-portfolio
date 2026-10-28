/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Proxy API and uploaded images through this domain so cookies stay
  // first-party. BACKEND_URL is only set in the deployed environment.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/services-images/:path*',
        destination: `${backendUrl}/services-images/:path*`
      }
    ];
  }
};

export default nextConfig;
