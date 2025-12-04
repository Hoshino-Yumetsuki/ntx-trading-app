/**
 * @type {import('next-image-export-optimizer').ExportImagesConfig}
 */
const config = {
  // 输出文件夹（构建产物）
  exportFolderPath: 'out',
  // 原始图片位置
  imageFolderPath: 'public',
  // 生成的图片质量 (1-100)
  quality: 90,
  // 生成的图片格式
  storePicturesInWEBP: true,
  // 是否生成模糊占位图
  generateAndUseBlurImages: true,
  // 图片尺寸配置
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
}

module.exports = config
