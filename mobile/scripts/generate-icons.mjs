/**
 * Rasterize the gaadi.pk favicon SVG into Expo icon assets (PNG).
 * Uses sharp when available; otherwise writes a solid-brand PNG fallback.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const assets = path.join(root, 'assets')
const svgPath = path.join(root, '..', 'public', 'favicon.svg')

const svg = fs.readFileSync(svgPath, 'utf8')

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.log('Installing sharp…')
    const { execSync } = await import('child_process')
    execSync('npm install --no-save sharp', { cwd: root, stdio: 'inherit' })
    sharp = createRequire(import.meta.url)(path.join(root, 'node_modules', 'sharp'))
  }

  const sizes = {
    'icon.png': 1024,
    'splash-icon.png': 512,
    'adaptive-icon.png': 1024,
    'favicon.png': 48,
  }

  for (const [name, size] of Object.entries(sizes)) {
    const out = path.join(assets, name)
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out)
    console.log('wrote', name, size)
  }

  // Adaptive icon layers (foreground = logo on transparent; background = brand blue)
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background: { r: 37, g: 99, b: 235 },
    },
  })
    .png()
    .toFile(path.join(assets, 'android-icon-background.png'))

  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assets, 'android-icon-foreground.png'))

  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .greyscale()
    .png()
    .toFile(path.join(assets, 'android-icon-monochrome.png'))

  console.log('Icon assets ready.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
