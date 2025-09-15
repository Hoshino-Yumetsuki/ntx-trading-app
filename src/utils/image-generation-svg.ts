import { toSvg, toBlob } from 'html-to-image';

export async function generateImageWithSVG(
  element: HTMLElement,
  options: {
    width: number;
    height: number;
    pixelRatio?: number;
    minBlobSize?: number;
    maxAttempts?: number;
    retryDelay?: number;
  }
): Promise<string | null> {
  const {
    width,
    height,
    pixelRatio = 2,
    minBlobSize = 50000,
    maxAttempts = 10,
    retryDelay = 500
  } = options;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      if (isIOS) {
        const blob = await toBlob(element, {
          width: width,
          height: height,
          pixelRatio: pixelRatio,
          backgroundColor: '#ffffff',
          cacheBust: true,
          filter: () => {
            return true;
          }
        });

        if (blob && blob.size > minBlobSize) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } else {
        const svgDataUrl = await toSvg(element, {
          backgroundColor: '#ffffff',
          cacheBust: true,
          pixelRatio: pixelRatio,
          width: width,
          height: height,
          fontEmbedCSS: `
            * {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            }
          `,
          filter: () => true
        });

        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/png'));
            } else {
              reject(new Error('Could not get canvas context'));
            }
          };
          img.onerror = reject;
          img.src = svgDataUrl;
        });
      }
    } catch (error) {
      console.error(`Image generation attempt ${attempt + 1} error:`, error);
    }

    attempt += 1;
  }

  console.error('Failed to generate valid image after maximum attempts');
  return null;
}