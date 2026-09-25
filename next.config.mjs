/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "imagedelivery.net" }] },
  async headers() {
    const development = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${development ? "'unsafe-eval' " : ""}https://challenges.cloudflare.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://imagedelivery.net",
      "font-src 'self'",
      `connect-src 'self' https://challenges.cloudflare.com https://upload.imagedelivery.net${development ? " ws: wss:" : ""}`,
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'",
    ].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
