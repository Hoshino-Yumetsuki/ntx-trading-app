import { domToDataUrl } from 'modern-screenshot'

export async function generateImageWithRetry(
  element: HTMLElement,
  options: {
    width: number
    height: number
    pixelRatio?: number
    minBlobSize?: number
    maxAttempts?: number
    retryDelay?: number
  }
): Promise<string | null> {
  const {
    width,
    height,
    pixelRatio = 2,
    minBlobSize = 50000,
    maxAttempts = 10,
    retryDelay = 500
  } = options

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  let attempt = 0

  while (attempt < maxAttempts) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }

      const dataUrl = await domToDataUrl(element, {
        width: width,
        height: height,
        scale: pixelRatio,
        backgroundColor: '#ffffff',
        style: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        timeout: isIOS ? 10000 : 5000
      })

      if (dataUrl && dataUrl.length > minBlobSize) {
        return dataUrl
      }

      console.log(
        `Image generation attempt ${attempt + 1} failed, data URL size: ${dataUrl?.length || 0}`
      )
    } catch (error) {
      console.error(`Image generation attempt ${attempt + 1} error:`, error)
    }

    attempt += 1
  }

  console.error('Failed to generate valid image after maximum attempts')
  return null
}
