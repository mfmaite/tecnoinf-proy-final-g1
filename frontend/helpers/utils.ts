function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function isVideo(url?: string | null) {
  if (!url) return false
  return /(\.mp4|\.webm|\.ogg)(\?|#|$)/i.test(url)
}

function isImage(url?: string | null) {
  if (!url) return false
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.avif|\.svg)(\?|#|$)/i.test(url)
}

export {
  formatDate,
  isVideo,
  isImage
}
