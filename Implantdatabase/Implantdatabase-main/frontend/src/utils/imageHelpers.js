/**
 * Image URL helper utilities for Implant Database
 * Converts between base64, relative paths, and full URLs
 */

/**
 * Get API base URL from environment or default
 * @returns {string} Base URL without /api suffix
 */
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = import.meta?.env?.VITE_API_URL;
    if (envUrl) {
      return envUrl.replace('/api', '');
    }
    
    // Auto-detect from window location
    const { protocol, hostname } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return `${protocol}//${hostname}:5000`;
    }
    
    return window.location.origin;
  }
  
  return 'http://localhost:5000';
};

/**
 * Convert image path/URL to full URL
 * Handles: data URLs, full URLs, relative paths
 * 
 * @param {string|null|undefined} imageUrl - Image URL or path
 * @returns {string|null} Full image URL or null
 */
export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }
  
  // Already a data URL or full URL
  if (
    imageUrl.startsWith('data:') || 
    imageUrl.startsWith('http://') || 
    imageUrl.startsWith('https://')
  ) {
    return imageUrl;
  }
  
  // Relative path from backend (e.g., /uploads/implants/image.jpg)
  if (imageUrl.startsWith('/uploads/')) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${imageUrl}`;
  }
  
  // Unknown format, return as is
  return imageUrl;
};

/**
 * Extract image URLs from implant object
 * @param {Object} implant - Implant object
 * @returns {Array<{id: number, url: string|null}>} Array of image objects
 */
export const getImplantImages = (implant) => {
  if (!implant) return [];
  
  return [1, 2, 3].map((id) => {
    const key = `image${id}`;
    let url = implant[key] || implant[`${key}DataUrl`] || null;
    
    // Check images array/object
    if (!url && implant.images) {
      if (Array.isArray(implant.images)) {
        url = implant.images[id - 1] || null;
      } else if (typeof implant.images === 'object') {
        url = implant.images[key] || null;
      }
    }
    
    return {
      id,
      url: resolveImageUrl(url),
    };
  });
};

/**
 * Get first available image from implant
 * @param {Object} implant - Implant object
 * @returns {string|null} First available image URL or null
 */
export const getImplantThumbnail = (implant) => {
  const images = getImplantImages(implant);
  const firstImage = images.find((img) => img.url);
  return firstImage ? firstImage.url : null;
};

/**
 * Check if image URL is valid (not empty or placeholder)
 * @param {string|null|undefined} imageUrl - Image URL to check
 * @returns {boolean} True if valid image URL
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }
  
  const trimmed = imageUrl.trim();
  
  // Empty or null placeholder
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return false;
  }
  
  // Data URL should have content
  if (trimmed.startsWith('data:')) {
    return trimmed.length > 50; // Minimum for a real data URL
  }
  
  // HTTP URL should be at least somewhat long
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.length > 10;
  }
  
  // Relative path
  if (trimmed.startsWith('/')) {
    return trimmed.length > 1;
  }
  
  return true;
};

/**
 * Create placeholder image URL for missing images
 * @param {string} text - Text to display in placeholder
 * @returns {string} Data URL for placeholder image
 */
export const createPlaceholderImage = (text = '?') => {
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="48" 
            fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
        ${text.substring(0, 3)}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default {
  getApiBaseUrl,
  resolveImageUrl,
  getImplantImages,
  getImplantThumbnail,
  isValidImageUrl,
  createPlaceholderImage,
};
