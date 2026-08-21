import { resolveMediaUrl } from '../utils/url';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useImageModal } from '../contexts/ImageModalContext';

export function ImageModal() {
  const { isOpen, imageUrl, altText, closeImage } = useImageModal();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeImage();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeImage]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  // Compute the original, high-res download URL
  // e.g., /uploads/image.jpg -> /uploads/image_original.jpg
  const getOriginalUrl = (url: string) => {
    if (url.includes('cloudinary.com')) return url;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const isAbsolute = url.startsWith('http');
    const fullUrl = isAbsolute ? url : `${baseUrl}${url}`;
    
    try {
      const parsed = new URL(fullUrl);
      const pathname = parsed.pathname;
      const match = pathname.match(/(\.[\w\d_-]+)$/i);
      if (match) {
        parsed.pathname = pathname.substring(0, pathname.lastIndexOf(match[1])) + '_original' + match[1];
        return parsed.toString();
      }
    } catch (e) {
      // fallback
    }
    return fullUrl;
  };

  const downloadUrl = getOriginalUrl(imageUrl);
  const displayUrl = imageUrl.startsWith('http') ? imageUrl : resolveMediaUrl(imageUrl);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeImage}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      >
        <button
          onClick={closeImage}
          className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
        >
          <img
            src={displayUrl}
            alt={altText || 'Expanded view'}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg hover:bg-primary-dark transition-all hover:-translate-y-1"
            >
              <Download className="h-5 w-5" />
              Download Original High-Res
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
