const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

const cleanupTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
};

const uploadFile = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder || process.env.CLOUDINARY_FOLDER,
      resource_type: 'auto'
    });
    return { url: result.secure_url, publicId: result.public_id };
  } finally {
    cleanupTempFile(file.path);
  }
};

const deleteFile = async (publicId) => {
  if (!publicId) return false;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (e) {
    return false;
  }
};

const deleteFiles = async (publicIds) => {
  const results = await Promise.allSettled(publicIds.map(id => deleteFile(id)));
  return results.filter(r => r.status === 'fulfilled' && r.value).length;
};

const extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const uploadIdx = parts.findIndex(p => p === 'upload');
    if (uploadIdx === -1) return null;
    const afterUpload = parts.slice(uploadIdx + 1);
    if (afterUpload[0] && afterUpload[0].startsWith('v')) afterUpload.shift();
    let publicId = afterUpload.join('/');
    const lastDot = publicId.lastIndexOf('.');
    if (lastDot > -1) publicId = publicId.substring(0, lastDot);
    return publicId;
  } catch {
    return null;
  }
};

const deleteRemovedFiles = async (removedUrls) => {
  if (!removedUrls || !removedUrls.length) return;
  const publicIds = removedUrls.map(extractPublicIdFromUrl).filter(Boolean);
  if (publicIds.length) await deleteFiles(publicIds);
};

module.exports = { uploadFile, deleteFile, deleteFiles, deleteRemovedFiles, extractPublicIdFromUrl };
