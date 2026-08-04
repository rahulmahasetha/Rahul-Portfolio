/**
 * Safely resolves a media URL.
 * Supports backward compatibility: 
 * If it's already an absolute HTTP URL (like Cloudinary), it returns it directly (applying optional transformations for images).
 * If it's a relative URL (like /uploads/...), it prepends the backend VITE_API_URL.
 */
export const resolveMediaUrl = (url?: string, options: { optimize?: boolean } = {}) => {
  if (!url) return '';
  
  // Apply Cloudinary automatic optimization format for images (WebP/AVIF)
  // We only optimize if it's an image and not explicitly skipped
  const isCloudinary = url.includes('res.cloudinary.com');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('/image/upload/');
  
  let finalUrl = url;
  
  if (isCloudinary && isImage && options.optimize !== false) {
    // Inject f_auto,q_auto into the Cloudinary URL to serve optimized images
    if (!url.includes('/upload/f_auto,q_auto/')) {
      finalUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }

  if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
    return finalUrl;
  }
  
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
};
