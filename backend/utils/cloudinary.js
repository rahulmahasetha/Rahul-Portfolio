const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary based on CLOUDINARY_URL environment variable
// If CLOUDINARY_URL is missing, it will gracefully fail when attempting uploads
cloudinary.config({
  secure: true
});

/**
 * Uploads a local file to Cloudinary and deletes the local file.
 * @param {string} localFilePath - The absolute or relative path to the local file.
 * @param {string} folder - The Cloudinary folder to organize assets (e.g., 'projects', 'resume')
 * @returns {Promise<object>} - Returns { secure_url, public_id }
 */
const uploadToCloudinary = async (localFilePath, folder) => {
  if (!localFilePath || !fs.existsSync(localFilePath)) {
    throw new Error('Local file does not exist');
  }

  try {
    // We use resource_type: "auto" to handle both images and raw PDFs seamlessly
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: 'auto'
    });
    
    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    // Attempt to delete local file on failure to prevent disk space leaks
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new Error('Failed to upload to Cloudinary: ' + error.message);
  }
};

/**
 * Deletes an asset from Cloudinary using its public_id.
 * @param {string} publicId - The Cloudinary public_id of the asset to delete.
 * @param {string} resourceType - The resource type ('image', 'video', 'raw', 'auto').
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    // If it's a raw file (like PDF), resource_type needs to be 'raw' to delete it successfully
    // If we passed 'auto' originally, Cloudinary often assigns 'image' or 'raw'. We try both if unsure.
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error.message);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
