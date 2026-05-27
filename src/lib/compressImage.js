export async function compressImage(file, options = {}) {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.92 } = options

  const img = await new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => { URL.revokeObjectURL(el.src); resolve(el) }
    el.onerror = () => { URL.revokeObjectURL(el.src); reject(new Error('Image load failed')) }
    el.src = URL.createObjectURL(file)
  })

  let { width, height } = img
  if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth }
  if (height > maxHeight) { width = Math.round(width * maxHeight / height); height = maxHeight }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Compression failed'))
    }, 'image/webp', quality)
  })
}
