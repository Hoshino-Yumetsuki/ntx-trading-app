import { readFileSync } from 'fs'
import { generateServiceWorker } from './scripts/generate-sw.mjs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

await generateServiceWorker()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js'
  },
  transpilePackages: ['next-image-export-optimizer'],
  serverExternalPackages: ['thread-stream', 'pino'],
  env: {
    nextImageExportOptimizer_imageFolderPath: 'public',
    nextImageExportOptimizer_exportFolderPath: 'out',
    nextImageExportOptimizer_quality: '75',
    nextImageExportOptimizer_storePicturesInWEBP: 'true',
    nextImageExportOptimizer_generateAndUseBlurImages: 'true',
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://app.ntxdao.com/api',
    NEXT_PUBLIC_RSS_BASE_URL: process.env.NEXT_PUBLIC_RSS_BASE_URL || 'https://app.ntxdao.com/rss',
    // 代理目标（Service Worker 使用）
    NEXT_PUBLIC_API_PROXY_TARGET: process.env.NEXT_PUBLIC_API_PROXY_TARGET || 'https://api.ntxdao.com/api',
    NEXT_PUBLIC_RSS_PROXY_TARGET: process.env.NEXT_PUBLIC_RSS_PROXY_TARGET || 'https://rss.ntxdao.com/rss'
  }
}

export default nextConfig
