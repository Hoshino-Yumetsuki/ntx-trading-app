import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = resolve(__dirname, '..')
const sourcePath = resolve(projectRoot, 'public', 'origin_sw.js')
const targetPath = resolve(projectRoot, 'public', 'sw.js')
const packagePath = resolve(projectRoot, 'package.json')

async function ensureDirExists(filePath) {
  const dir = dirname(filePath)
  await mkdir(dir, { recursive: true })
}

export async function generateServiceWorker() {
  const [source, pkgRaw] = await Promise.all([
    readFile(sourcePath, 'utf-8'),
    readFile(packagePath, 'utf-8')
  ])
  const { version = '1.0.0' } = JSON.parse(pkgRaw)
  await ensureDirExists(targetPath)
  const banner = `// Auto-generated from origin_sw.js on ${new Date().toISOString()}`
  const output = `${banner}\n${source.replace(/__SW_VERSION__/g, version)}`
  await writeFile(targetPath, output)
  console.log(`[SW] Generated ${targetPath}`)
  return targetPath
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateServiceWorker().catch((error) => {
    console.error('[SW] Failed to generate service worker:', error)
    process.exitCode = 1
  })
}
