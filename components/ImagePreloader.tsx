import { useEffect } from 'react';
import { ImageOptimizer } from '@/utils/imageOptimization';

interface ImagePreloaderProps {
  images: string[];
  priority?: 'low' | 'high';
}

export function ImagePreloader({ images, priority = 'low' }: ImagePreloaderProps) {
  useEffect(() => {
    if (images.length === 0) return;

    const preloadImages = async () => {
      try {
        // Preload with different quality based on priority
        const quality = priority === 'high' ? 90 : 70;
        await ImageOptimizer.preloadImages(images, { quality });
        console.log(`Preloaded ${images.length} images with ${priority} priority`);
      } catch (error) {
        console.warn('Image preloading failed:', error);
      }
    };

    // Delay preloading for low priority images
    const delay = priority === 'high' ? 0 : 2000;
    const timeoutId = setTimeout(preloadImages, delay);

    return () => clearTimeout(timeoutId);
  }, [images, priority]);

  return null; // This component doesn't render anything
}

export default ImagePreloader;