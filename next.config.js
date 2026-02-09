/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ssl.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'openweathermap.org', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;









