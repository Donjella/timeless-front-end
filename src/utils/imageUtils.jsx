/**
 * Validates an image URL with a more lenient approach
 * @param {string} url - Image URL to validate
 * @returns {boolean} - Whether the URL looks valid
 */
export const validateImageUrl = (url) => {
    if (!url) return false;
  
    // More permissive URL regex that allows various domain formats and paths
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w]{2,}([\/\w\.-]*)*\/?$/i;
    return urlRegex.test(url);
  };
  
  /**
   * Checks if an image URL is accessible
   * @param {string} url - Image URL to check
   * @returns {Promise<boolean>} - Whether the image can be loaded
   */
  export const isImageUrlAccessible = async (url) => {
    if (!validateImageUrl(url)) return false;
  
    try {
      // Create an image element to test loading
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    } catch (error) {
      console.warn('Image URL check failed:', error);
      return false;
    }
  };
  
  /**
   * Get a fallback image placeholder
   * @returns {string} - Placeholder image URL or data URI
   */
  export const getImagePlaceholder = () => {
    return 'https://via.placeholder.com/150?text=Watch+Image';
  };
  
  /**
   * Attempt to standardize image URL
   * @param {string} url - Original image URL
   * @returns {string} - Standardized URL
   */
  export const normalizeImageUrl = (url) => {
    if (!url) return '';
  
    // Trim whitespace
    url = url.trim();
  
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
  
    return url;
  };