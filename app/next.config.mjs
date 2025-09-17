import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
})(nextConfig);
