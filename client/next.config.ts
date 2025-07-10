import type { NextConfig } from 'next'
import path from 'path';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config) => {
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

    // Enable Source Maps
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules[\\\/]@cesium/,
      use: { loader: 'source-map-loader' },
      enforce: 'pre'
    });

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
        // Relaxed security for pages that need to load external resources
        source: '/mentor-registration',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        // Keep strict security for other routes
        source: '/((?!mentor-registration).*)',
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
