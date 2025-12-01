'use client'

function imageLoader({ src, width, quality }) {
  // 对于外部 URL（http/https），直接返回
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // 开发模式下直接返回原始图片
  if (process.env.NODE_ENV === 'development') {
    return src
  }

  // 生产环境：使用 next-image-export-optimizer 的格式
  const path = src.startsWith('/') ? src.slice(1) : src
  const filename = path.split('/').pop()
  const dirname = path.split('/').slice(0, -1).join('/')
  const ext = filename.split('.').pop()
  const name = filename.replace(`.${ext}`, '')
  
  // 返回优化后的图片路径
  const optimizedPath = dirname 
    ? `/${dirname}/nextImageExportOptimizer/${name}-opt-${width}.WEBP`
    : `/nextImageExportOptimizer/${name}-opt-${width}.WEBP`
  
  return optimizedPath
}

export default imageLoader
