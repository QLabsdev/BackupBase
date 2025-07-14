/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better Netlify compatibility
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure proper asset prefix for Netlify
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Configure for client-side routing
  distDir: '.next',

  // Optimize for production
  swcMinify: true,

  // Handle environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
