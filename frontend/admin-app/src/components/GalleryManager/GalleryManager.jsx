import React, { useState } from 'react';
import { FiTrash2, FiImage, FiReplace, FiCheck, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function GalleryManager({ initialImages = [], initialThumbnail = '', onGalleryUpdate }) {
  const [images, setImages] = useState(initialImages);
  const [thumbnail, setThumbnail] = useState(initialThumbnail);
  const [deletingUrl, setDeletingUrl] = useState(null);

  // Handle Delete S3 image
  const handleDelete = async (url) => {
    setDeletingUrl(url);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to delete image from S3');
      }

      // Update state
      const updatedImages = images.filter(img => img !== url);
      setImages(updatedImages);

      let updatedThumbnail = thumbnail;
      if (thumbnail === url) {
        updatedThumbnail = updatedImages[0] || '';
        setThumbnail(updatedThumbnail);
      }

      if (onGalleryUpdate) {
        onGalleryUpdate({
          images: updatedImages,
          thumbnail: updatedThumbnail
        });
      }

      toast.success('Image deleted from AWS S3');
    } catch (error) {
      toast.error(`Deletion failed: ${error.message}`);
    } finally {
      setDeletingUrl(null);
    }
  };

  // Set selected image as Primary Thumbnail
  const makeThumbnail = (url) => {
    setThumbnail(url);
    if (onGalleryUpdate) {
      onGalleryUpdate({
        images,
        thumbnail: url
      });
    }
    toast.success('Primary thumbnail updated');
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-white border border-gray-150 p-5 rounded-large shadow-premium">
      <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-800 uppercase">Gallery Manager</h3>
          <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Manage existing files uploaded on AWS S3</p>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-large">
          <FiImage size={32} className="mb-2 text-gray-300" />
          <span className="text-xs font-bold">No images in gallery yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url, index) => {
            const isThumb = url === thumbnail;
            const isDeleting = deletingUrl === url;

            return (
              <div
                key={index}
                className={`relative rounded-large overflow-hidden border bg-gray-50 flex flex-col transition-all group ${
                  isThumb ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Image */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-white">
                  <img src={url} alt={`gallery-${index}`} className="w-full h-full object-cover" />
                </div>

                {/* Badge */}
                {isThumb && (
                  <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                    <FiCheck size={10} /> Primary
                  </span>
                )}

                {/* Info and Actions */}
                <div className="p-2 flex items-center justify-between border-t border-gray-100 bg-white">
                  <span className="text-[9px] font-bold text-gray-450 uppercase">View #{index + 1}</span>
                  
                  <div className="flex gap-1.5">
                    {/* Make Thumbnail button */}
                    {!isThumb && (
                      <button
                        onClick={() => makeThumbnail(url)}
                        title="Set as Primary Thumbnail"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light/10 rounded transition-colors"
                      >
                        <FiReplace size={12} />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(url)}
                      disabled={isDeleting}
                      title="Delete Image from S3"
                      className="p-1.5 text-gray-450 hover:text-danger hover:bg-red-50 rounded transition-colors"
                    >
                      {isDeleting ? <FiLoader size={12} className="animate-spin" /> : <FiTrash2 size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
