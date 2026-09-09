/**
 * Implant Service - Dedicated API service for implant operations
 * Supports image uploads via FormData
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8900/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || localStorage.getItem('auth_token');
};

/**
 * Create headers with auth token
 */
const getHeaders = (includeContentType = true) => {
  const headers = {};
  const token = getAuthToken();
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Convert File object or data URL to File for FormData
 */
const prepareImageFile = (image, fieldName) => {
  // If already a File object, return as is
  if (image instanceof File) {
    return image;
  }
  
  // If it's a data URL (base64), convert to File
  if (typeof image === 'string' && image.startsWith('data:')) {
    try {
      const arr = image.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const ext = mime.split('/')[1] || 'jpg';
      return new File([u8arr], `${fieldName}.${ext}`, { type: mime });
    } catch (error) {
      console.error('Error converting data URL to File:', error);
      return null;
    }
  }
  
  // If it's already a URL path (from backend), skip it (don't re-upload)
  if (typeof image === 'string' && image.startsWith('/uploads/')) {
    return null;
  }
  
  return null;
};

// ========================================
// CRUD Operations
// ========================================

/**
 * Get all implants
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of implants
 */
export const getAllImplants = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = `${API_BASE}/implants${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching implants:', error);
    throw error;
  }
};

/**
 * Get implant by ID
 * @param {number} id - Implant ID
 * @returns {Promise<Object>} Implant object
 */
export const getImplantById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/implants/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching implant ${id}:`, error);
    throw error;
  }
};

/**
 * Get implant by slug
 * @param {string} slug - Implant slug
 * @returns {Promise<Object>} Implant object
 */
export const getImplantBySlug = async (slug) => {
  try {
    // Since backend doesn't have slug endpoint, we'll get all and filter
    const implants = await getAllImplants();
    const implant = implants.find((imp) => 
      (imp.slug || '').toLowerCase() === slug.toLowerCase()
    );
    
    if (!implant) {
      throw new Error('Implant not found');
    }
    
    return implant;
  } catch (error) {
    console.error(`Error fetching implant by slug ${slug}:`, error);
    throw error;
  }
};

/**
 * Create new implant with images
 * @param {Object} data - Implant data (including image1, image2, image3 as File or data URL)
 * @returns {Promise<Object>} Created implant
 */
export const createImplant = async (data) => {
  try {
    const formData = new FormData();
    
    // Add all non-image fields
    Object.entries(data).forEach(([key, value]) => {
      if (!key.startsWith('image') && value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Add image files
    ['image1', 'image2', 'image3'].forEach((key) => {
      if (data[key]) {
        const file = prepareImageFile(data[key], key);
        if (file) {
          formData.append(key, file);
        }
      }
    });
    
    // Debug log
    console.log('📤 Creating implant with:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${(value.size / 1024).toFixed(2)}KB)`);
      } else {
        console.log(`  ${key}: ${String(value).substring(0, 50)}`);
      }
    }
    
    const response = await fetch(`${API_BASE}/implants`, {
      method: 'POST',
      headers: {
        Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : undefined,
      },
      body: formData,
    });
    
    const result = await handleResponse(response);
    console.log('✅ Implant created:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating implant:', error);
    throw error;
  }
};

/**
 * Update implant with optional new images
 * @param {number} id - Implant ID
 * @param {Object} data - Updated data (including image1, image2, image3 as File or data URL)
 * @returns {Promise<Object>} Updated implant
 */
export const updateImplant = async (id, data) => {
  try {
    const formData = new FormData();
    
    // Add all non-image fields
    Object.entries(data).forEach(([key, value]) => {
      if (!key.startsWith('image') && value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Add image files (only if they are new files or data URLs)
    ['image1', 'image2', 'image3'].forEach((key) => {
      if (data[key]) {
        const file = prepareImageFile(data[key], key);
        if (file) {
          formData.append(key, file);
        }
      }
    });
    
    // Debug log
    console.log(`📤 Updating implant ${id} with:`);
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${(value.size / 1024).toFixed(2)}KB)`);
      } else {
        console.log(`  ${key}: ${String(value).substring(0, 50)}`);
      }
    }
    
    const response = await fetch(`${API_BASE}/implants/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : undefined,
      },
      body: formData,
    });
    
    const result = await handleResponse(response);
    console.log('✅ Implant updated:', result);
    return result;
  } catch (error) {
    console.error(`❌ Error updating implant ${id}:`, error);
    throw error;
  }
};

/**
 * Delete implant (will also delete associated images)
 * @param {number} id - Implant ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteImplant = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/implants/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const result = await handleResponse(response);
    console.log('✅ Implant deleted:', id);
    return result;
  } catch (error) {
    console.error(`❌ Error deleting implant ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle implant status (Active/Inactive)
 * @param {number} id - Implant ID
 * @param {string} currentStatus - Current status
 * @returns {Promise<Object>} Updated implant
 */
export const toggleImplantStatus = async (id, currentStatus) => {
  try {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const response = await fetch(`${API_BASE}/implants/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    
    const result = await handleResponse(response);
    console.log('✅ Status toggled:', result);
    return result;
  } catch (error) {
    console.error(`❌ Error toggling status for implant ${id}:`, error);
    throw error;
  }
};

// ========================================
// Image URL Helpers
// ========================================

/**
 * Get full image URL from relative path
 * @param {string} imagePath - Image path from database
 * @returns {string|null} Full URL or null
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Already a full URL or data URL
  if (
    imagePath.startsWith('http://') || 
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }
  
  // Relative path from backend
  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8900';
    return `${baseUrl}${imagePath}`;
  }
  
  return imagePath;
};

/**
 * Get all image URLs from implant object
 * @param {Object} implant - Implant object
 * @returns {Array<string>} Array of image URLs (filtered nulls)
 */
export const getImplantImages = (implant) => {
  if (!implant) return [];
  
  return [
    getImageUrl(implant.image1),
    getImageUrl(implant.image2),
    getImageUrl(implant.image3),
  ].filter(Boolean);
};

/**
 * Get first available image (thumbnail)
 * @param {Object} implant - Implant object
 * @returns {string|null} First image URL or null
 */
export const getImplantThumbnail = (implant) => {
  const images = getImplantImages(implant);
  return images[0] || null;
};

// Export default object
export default {
  // CRUD
  getAllImplants,
  getImplantById,
  getImplantBySlug,
  createImplant,
  updateImplant,
  deleteImplant,
  toggleImplantStatus,
  
  // Image helpers
  getImageUrl,
  getImplantImages,
  getImplantThumbnail,
};
