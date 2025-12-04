export const preloadImages = (urls: string[]): Promise<undefined[]> => {
  const validUrls = urls.filter(
    (url) => typeof url === 'string' && url.length > 0
  )

  const promises = validUrls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => resolve()

      img.onerror = () => {
        console.error(`图片预加载失败: ${url}`)
        resolve()
      }

      img.src = url
    })
  })

  return Promise.all(promises)
}
