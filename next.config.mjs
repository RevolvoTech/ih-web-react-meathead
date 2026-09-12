/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/ops",
        destination: "/admin/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
