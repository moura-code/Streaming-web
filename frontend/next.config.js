module.exports = {
  reactStrictMode: true,
  experimental: {
    transpilePackages: ["ui"],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  }
};
