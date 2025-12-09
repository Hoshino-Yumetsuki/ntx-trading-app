import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

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
    NEXT_PUBLIC_APP_VERSION: pkg.version
  }
}

export default nextConfig
