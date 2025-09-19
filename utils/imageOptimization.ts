import { Platform, Image as RNImage } from 'react-native';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  fit?: 'crop' | 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'face' | 'entropy' | 'attention';
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  auto?: 'compress' | 'enhance' | 'face' | 'redeye';
}

export interface OptimizedImageSource {
  uri: string;
  width?: number;
  height?: number;
}

/**
 * Optimizes image URLs for faster loading and better performance
 * Supports Unsplash, Cloudinary, and other image services
 */
export class ImageOptimizer {
  private static readonly DEFAULT_QUALITY = 85;
  private static readonly DEFAULT_FORMAT = Platform.OS === 'web' ? 'webp' : 'jpg';
  
  /**
   * Optimizes an image URL with the given options
   */
  static optimize(url: string, options: ImageOptimizationOptions = {}): OptimizedImageSource {
    if (!url) {
      return { uri: this.getPlaceholderImage(options.width, options.height) };
    }

    // Handle different image services
    if (url.includes('unsplash.com')) {
      return this.optimizeUnsplash(url, options);
    } else if (url.includes('cloudinary.com')) {
      return this.optimizeCloudinary(url, options);
    } else if (url.includes('via.placeholder.com')) {
      return this.optimizePlaceholder(url, options);
    }

    // For other URLs, return as-is but add dimensions if available
    return {
      uri: url,
      width: options.width,
      height: options.height
    };
  }

  /**
   * Optimizes Unsplash images using their URL API
   */
  private static optimizeUnsplash(url: string, options: ImageOptimizationOptions): OptimizedImageSource {
    const {
      width = 400,
      height = 400,
      quality = this.DEFAULT_QUALITY,
      format = this.DEFAULT_FORMAT,
      fit = 'crop',
      crop = 'center',
      auto = 'compress'
    } = options;

    // Parse existing Unsplash URL
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();

    // Add optimization parameters
    params.set('w', width.toString());
    if (height && fit === 'crop') {
      params.set('h', height.toString());
    }
    params.set('q', quality.toString());
    params.set('fm', format);
    params.set('fit', fit);
    params.set('crop', crop);
    params.set('auto', auto);

    // Add additional effects if specified
    if (options.blur) params.set('blur', options.blur.toString());
    if (options.brightness) params.set('bri', options.brightness.toString());
    if (options.contrast) params.set('con', options.contrast.toString());
    if (options.saturation) params.set('sat', options.saturation.toString());
    if (options.sharpen) params.set('sharp', options.sharpen.toString());

    return {
      uri: `${baseUrl}?${params.toString()}`,
      width,
      height
    };
  }

  /**
   * Optimizes Cloudinary images using their transformation API
   */
  private static optimizeCloudinary(url: string, options: ImageOptimizationOptions): OptimizedImageSource {
    const {
      width = 400,
      height = 400,
      quality = this.DEFAULT_QUALITY,
      format = this.DEFAULT_FORMAT,
      fit = 'crop'
    } = options;

    // Parse Cloudinary URL structure
    const parts = url.split('/upload/');
    if (parts.length !== 2) return { uri: url };

    const [baseUrl, imagePath] = parts;
    const transformations = [];

    // Add transformations
    transformations.push(`w_${width}`);
    if (height && fit === 'crop') {
      transformations.push(`h_${height}`);
    }
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    transformations.push(`c_${fit}`);

    // Add effects
    if (options.blur) transformations.push(`e_blur:${options.blur}`);
    if (options.brightness) transformations.push(`e_brightness:${options.brightness}`);
    if (options.contrast) transformations.push(`e_contrast:${options.contrast}`);
    if (options.saturation) transformations.push(`e_saturation:${options.saturation}`);
    if (options.sharpen) transformations.push(`e_sharpen`);

    const transformationString = transformations.join(',');
    
    return {
      uri: `${baseUrl}/upload/${transformationString}/${imagePath}`,
      width,
      height
    };
  }

  /**
   * Optimizes placeholder images
   */
  private static optimizePlaceholder(url: string, options: ImageOptimizationOptions): OptimizedImageSource {
    const { width = 400, height = 400 } = options;
    
    // Extract text from existing placeholder if any
    const textMatch = url.match(/text=([^&]+)/);
    const text = textMatch ? decodeURIComponent(textMatch[1]) : 'Image';
    
    return {
      uri: `https://via.placeholder.com/${width}x${height}/E2E8F0/64748B?text=${encodeURIComponent(text)}`,
      width,
      height
    };
  }

  /**
   * Generates a placeholder image URL
   */
  private static getPlaceholderImage(width = 400, height = 400): string {
    return `https://via.placeholder.com/${width}x${height}/E2E8F0/64748B?text=No+Image`;
  }

  /**
   * Creates responsive image sources for different screen densities
   */
  static createResponsiveSources(url: string, baseOptions: ImageOptimizationOptions = {}) {
    const { width = 400, height = 400 } = baseOptions;
    
    return {
      // Low resolution for slow connections
      low: this.optimize(url, { ...baseOptions, width: Math.round(width * 0.5), height: Math.round(height * 0.5), quality: 60 }),
      // Standard resolution
      standard: this.optimize(url, { ...baseOptions, width, height, quality: 80 }),
      // High resolution for retina displays
      high: this.optimize(url, { ...baseOptions, width: width * 2, height: height * 2, quality: 90 })
    };
  }

  /**
   * Preloads images for better performance
   */
  static preloadImages(urls: string[], options: ImageOptimizationOptions = {}): Promise<void[]> {
    if (Platform.OS === 'web') {
      return Promise.all(
        urls.map(url => {
          return new Promise<void>((resolve, reject) => {
            const webImage = new (window as any).Image();
            webImage.onload = () => resolve();
            webImage.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            webImage.src = this.optimize(url, options).uri;
          });
        })
      );
    }
    
    // For React Native, we can use Image.prefetch
    return Promise.all(
      urls.map(url => RNImage.prefetch(this.optimize(url, options).uri).then(() => {}))
    );
  }

  /**
   * Gets optimal image size based on container dimensions and device pixel ratio
   */
  static getOptimalSize(containerWidth: number, containerHeight: number, maxWidth = 1200, maxHeight = 1200) {
    const pixelRatio = Platform.OS === 'web' ? window.devicePixelRatio || 1 : 2;
    
    const optimalWidth = Math.min(containerWidth * pixelRatio, maxWidth);
    const optimalHeight = Math.min(containerHeight * pixelRatio, maxHeight);
    
    return {
      width: Math.round(optimalWidth),
      height: Math.round(optimalHeight)
    };
  }

  /**
   * Common presets for different use cases
   */
  static presets = {
    thumbnail: { width: 100, height: 100, quality: 70, fit: 'crop' as const, crop: 'face' as const },
    avatar: { width: 80, height: 80, quality: 80, fit: 'crop' as const, crop: 'face' as const },
    card: { width: 300, height: 200, quality: 80, fit: 'crop' as const },
    hero: { width: 800, height: 400, quality: 90, fit: 'crop' as const },
    gallery: { width: 600, height: 600, quality: 85, fit: 'contain' as const },
    fullscreen: { width: 1200, height: 1200, quality: 90, fit: 'contain' as const }
  };
}

/**
 * Hook for using optimized images in React components
 */
export function useOptimizedImage(url: string, options: ImageOptimizationOptions = {}) {
  const optimizedSource = ImageOptimizer.optimize(url, options);
  
  return {
    source: optimizedSource,
    preload: () => ImageOptimizer.preloadImages([url], options)
  };
}

/**
 * Utility function for quick image optimization
 */
export function optimizeImage(url: string, preset: keyof typeof ImageOptimizer.presets | ImageOptimizationOptions = 'card') {
  const options = typeof preset === 'string' ? ImageOptimizer.presets[preset] : preset;
  return ImageOptimizer.optimize(url, options);
}

export default ImageOptimizer;
