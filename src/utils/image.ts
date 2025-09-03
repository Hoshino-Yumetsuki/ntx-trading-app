/**
 * 预加载图片资源
 * @param urls 图片 URL 数组 (可以是 http/https 链接或 base64 Data URL)
 * @returns 当所有图片加载或失败后 resolve 的 Promise
 */
export const preloadImages = (urls: string[]): Promise<undefined[]> => {
  // 过滤掉无效的 URL，例如空字符串或 null
  const validUrls = urls.filter(
    (url) => typeof url === 'string' && url.length > 0
  )

  const promises = validUrls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      // 这对于从其他域名加载图片并将其绘制到 canvas 上至关重要
      img.crossOrigin = 'anonymous'

      // 图片成功加载后，完成这个 Promise
      img.onload = () => resolve()

      // 如果某张图片加载失败，我们也算作完成，以避免整个流程被阻塞
      img.onerror = () => {
        console.error(`图片预加载失败: ${url}`)
        resolve()
      }

      img.src = url
    })
  })

  return Promise.all(promises)
}
