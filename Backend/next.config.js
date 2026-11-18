/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep mysql2 out of the bundle; it is loaded directly by Node at runtime.
  serverExternalPackages: ['mysql2'],
};

module.exports = nextConfig;
