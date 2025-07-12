import type { NextConfig } from 'next'
import path from 'path';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Strip debug pragmas
    config.module.rules.push({
      test: /\.js$/,
      enforce: 'pre',
      include: /node_modules[\\\/]@cesium[\\\/]engine/,
      use: [{
        loader: 'strip-pragma-loader',
        options: {
          pragmas: {
            debug: false,
          },
        },
      }],
    });

    // Configure Cesium correctly
    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(
      // Define relative base path in cesium for loading assets
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/cesium')
      })
    );

    // Enable Source Maps with better configuration
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules[\\\/]@cesium/,
      use: { 
        loader: 'source-map-loader',
        options: {
          filterSourceMappingUrl: (url: string, resourcePath: string) => {
            // Exclude source maps for node_modules
            if (/node_modules/.test(resourcePath)) {
              return false;
            }
            return true;
          }
        }
      },
      enforce: 'pre'
    });

    // Configure WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Cesium module name location
    if (!config.resolve) {
      config.resolve = {};
    }

    config.resolve.alias = {
      ...config.resolve.alias,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      http: false,
      https: false,
      zlib: false,
      url: false,
    };

    // Add node polyfills
    if (!config.resolve.modules) {
      config.resolve.modules = [];
    }

    config.resolve.modules.push(path.resolve(__dirname, 'node_modules'));

    return config;
  },
  transpilePackages: ['@cesium/engine', '@cesium/widgets'],
  headers: async () => {
    return [
      {
        source: '/(login|mentor-registration)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https://*.google.com https://*.googleapis.com https://*.gstatic.com https://accounts.google.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.gstatic.com https://*.googleapis.com https://*.googleusercontent.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://*.google.com https://*.googleapis.com https://*.gstatic.com https://accounts.google.com",
              "img-src 'self' data: blob: https: http:",
              "frame-src 'self' https://*.google.com https://accounts.google.com",
              "connect-src 'self' https://*.google.com https://accounts.google.com http://localhost:8000 http://192.168.0.106:8000 https://nominatim.openstreetmap.org",
              "font-src 'self' data: https://*.gstatic.com https://accounts.google.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          }
        ],
      },
      {
        // Keep strict security for other routes
        source: '/((?!login|mentor-registration).*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/cesium/:path*',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/cesium/:path*',
        destination: '/cesium/:path*',
      },
    ];
  },
  // Enable static file serving
  staticPageGenerationTimeout: 300,
  output: 'standalone',
  // Increase memory limit
  experimental: {
    memoryBasedWorkersCount: true,
  },
}

export default nextConfig
