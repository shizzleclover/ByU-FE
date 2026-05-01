interface CloudinaryLoaderParams {
  src: string
  width: number
  quality?: number
}

export default function cloudinaryLoader({ src, width, quality }: CloudinaryLoaderParams) {
  // Non-cloudinary URLs pass through unchanged
  if (!src.includes('cloudinary.com') && !src.startsWith('/')) {
    return src
  }
  if (src.startsWith('/')) {
    return src
  }

  const q = quality ?? 'auto'
  // Insert f_auto,q_auto,w_{width} transformation
  return src.replace('/upload/', `/upload/f_auto,q_${q},w_${width}/`)
}
