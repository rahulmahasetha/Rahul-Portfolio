import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImageModalContextType {
  openImage: (url: string, altText?: string) => void;
  closeImage: () => void;
  isOpen: boolean;
  imageUrl: string | null;
  altText: string | null;
}

const ImageModalContext = createContext<ImageModalContextType | undefined>(undefined);

export function ImageModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState<string | null>(null);

  const openImage = (url: string, alt: string = '') => {
    setImageUrl(url);
    setAltText(alt);
    setIsOpen(true);
  };

  const closeImage = () => {
    setIsOpen(false);
    setTimeout(() => {
      setImageUrl(null);
      setAltText(null);
    }, 300);
  };

  return (
    <ImageModalContext.Provider value={{ openImage, closeImage, isOpen, imageUrl, altText }}>
      {children}
    </ImageModalContext.Provider>
  );
}

export function useImageModal() {
  const context = useContext(ImageModalContext);
  if (context === undefined) {
    throw new Error('useImageModal must be used within an ImageModalProvider');
  }
  return context;
}
