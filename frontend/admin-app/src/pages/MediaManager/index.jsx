import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Card, Button, Modal, Spinner, ConfirmationDialog } from '../../../../shared/components/Common';
import { FiUploadCloud, FiTrash2, FiRefreshCw, FiEye, FiSearch, FiSliders, FiFolder, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function MediaManager() {
  const [images, setImages] = useState([]);
  const [provider, setProvider] = useState('local');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Filtering and searching states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Selection for bulk actions
  const [selectedKeys, setSelectedKeys] = useState([]);
  
  // Modals & Details
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [replacingKey, setReplacingKey] = useState(null);

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  // Fetch images from gallery API
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/images');
      setImages(response.data.files || []);
      setProvider(response.data.provider || 'local');
    } catch (error) {
      toast.error('Failed to load gallery images');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle Drag & Drop Upload
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (fileList) => {
    setUploading(true);
    setUploadProgress(10);
    const formData = new FormData();
    
    // Parse folders & name prefixes if files match a specific category
    let folder = 'products/general';
    if (categoryFilter) {
      folder = `products/${categoryFilter.toLowerCase()}`;
    }

    for (let i = 0; i < fileList.length; i++) {
      formData.append('images', fileList[i]);
    }
    formData.append('folder', folder);
    formData.append('viewType', 'gallery');

    try {
      setUploadProgress(40);
      const response = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Scale progress between 40% and 95%
          setUploadProgress(Math.min(95, 40 + Math.round(percent * 0.55)));
        }
      });
      setUploadProgress(100);
      toast.success(response.data.message || 'Images uploaded successfully');
      fetchImages();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload images');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Replace single image
  const handleReplaceClick = (key) => {
    setReplacingKey(key);
    setTimeout(() => {
      if (replaceInputRef.current) {
        replaceInputRef.current.click();
      }
    }, 100);
  };

  const handleReplaceFile = async (e) => {
    if (!e.target.files || !e.target.files[0] || !replacingKey) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('oldKey', replacingKey);
    
    // Attempt parsing details from the old key path
    const parts = replacingKey.split('/');
    const folder = parts.slice(0, -1).join('/');
    const originalName = parts[parts.length - 1];
    
    formData.append('folder', folder || 'products/general');
    formData.append('name', originalName.split('-')[0] || 'replaced');
    formData.append('viewType', originalName.includes('thumbnail') ? 'thumbnail' : 'replaced');

    setUploading(true);
    setUploadProgress(30);

    try {
      await api.post('/images/replace', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(100);
      toast.success('Image replaced successfully');
      fetchImages();
    } catch (error) {
      toast.error('Failed to replace image');
    } finally {
      setReplacingKey(null);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Delete single image
  const handleDeleteConfirm = async () => {
    try {
      await api.post('/images/delete-bulk', { keys: [deleteConfirmKey] });
      toast.success('Image deleted successfully');
      setImages(prev => prev.filter(img => img.key !== deleteConfirmKey));
      setSelectedKeys(prev => prev.filter(k => k !== deleteConfirmKey));
    } catch (error) {
      toast.error('Failed to delete image');
    } finally {
      setDeleteConfirmKey(null);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    try {
      const response = await api.post('/images/delete-bulk', { keys: selectedKeys });
      const successCount = response.data.data.success.length;
      toast.success(`Successfully deleted ${successCount} images`);
      fetchImages();
      setSelectedKeys([]);
    } catch (error) {
      toast.error('Bulk deletion failed');
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  // Toggle selection
  const toggleSelect = (key) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleSelectAll = () => {
    if (selectedKeys.length === filteredImages.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filteredImages.map(img => img.key));
    }
  };

  // Format File Size
  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter products by category & search
  const filteredImages = images.filter(img => {
    const matchesSearch = img.key.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter 
      ? img.key.toLowerCase().includes(`/products/${categoryFilter.toLowerCase()}/`)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Media Control Console</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">
            Active Provider: <span className="text-primary font-extrabold">{provider.toUpperCase()}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={fetchImages}>
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Gallery
        </Button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`w-full border-2 border-dashed rounded-large p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          dragActive 
            ? 'border-primary bg-primary-light scale-[1.01]' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        <FiUploadCloud size={48} className="text-gray-400 mb-3" />
        <h3 className="font-bold text-gray-700 mb-1">Drag and drop images here to upload</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-4">
          Select multiple product pictures. Compressed WebP conversion happens on-the-fly.
        </p>
        <Button size="sm">Choose Files</Button>
      </div>

      {/* Uploading Progress Bar */}
      {uploading && (
        <Card className="p-4 bg-gray-50 border border-primary-light">
          <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
            <span className="flex items-center gap-1">
              <Spinner size="sm" /> Uploading and Optimizing Images...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </Card>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-100 p-4 rounded-large shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search image paths..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              !categoryFilter 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {['Sofa', 'Chair', 'Bed', 'Dining', 'Tables', 'Storage'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredImages.length === 0 ? (
        <Card className="py-16 text-center text-gray-400">
          <FiFolder size={48} className="mx-auto mb-3 text-gray-300" />
          <h3 className="font-bold text-gray-700 mb-1">No images found</h3>
          <p className="text-xs">Drag files above or adjust filters to populate the gallery.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Select All checkbox */}
          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
              <input 
                type="checkbox"
                checked={selectedKeys.length === filteredImages.length}
                onChange={toggleSelectAll}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              Select All ({filteredImages.length} items)
            </label>
            {selectedKeys.length > 0 && (
              <Button 
                variant="danger" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setBulkDeleteConfirm(true)}
              >
                <FiTrash2 size={14} /> Bulk Delete ({selectedKeys.length})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredImages.map((img) => {
              const isSelected = selectedKeys.includes(img.key);
              return (
                <Card 
                  key={img.key} 
                  className={`p-0 relative group overflow-hidden border transition-all duration-300 ${
                    isSelected ? 'border-primary shadow-premium ring-2 ring-primary ring-opacity-20' : 'border-gray-100'
                  }`}
                >
                  {/* Select Checkbox (top-left) */}
                  <div className="absolute top-2 left-2 z-10">
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(img.key)}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer shadow-sm"
                    />
                  </div>

                  {/* Image Frame */}
                  <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100 relative">
                    <img 
                      src={img.url} 
                      alt={img.fileName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Hover Options Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setPreviewImage(img)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-primary hover:text-white transition-colors"
                        title="Preview"
                      >
                        <FiEye size={14} />
                      </button>
                      <button 
                        onClick={() => handleReplaceClick(img.key)}
                        className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Replace Image"
                      >
                        <FiRefreshCw size={14} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmKey(img.key)}
                        className="p-2 bg-white rounded-full text-danger hover:bg-danger hover:text-white transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3">
                    <p className="text-[10px] font-extrabold text-gray-700 truncate" title={img.fileName}>
                      {img.fileName}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold truncate mt-0.5" title={img.key}>
                      {img.key}
                    </p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-1">
                      {formatBytes(img.size)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden input for replace file */}
      <input 
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Lightbox / Image Preview Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage?.fileName || 'Image Preview'}>
        {previewImage && (
          <div className="flex flex-col gap-4">
            <div className="max-h-96 rounded-large overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-900">
              <img 
                src={previewImage.url} 
                alt={previewImage.fileName} 
                className="max-w-full max-h-96 object-contain"
              />
            </div>
            <div className="bg-gray-50 rounded-large p-4 text-xs font-semibold text-gray-500 border border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">File Path:</span>
                <span className="col-span-2 text-gray-800 break-all select-all font-mono">{previewImage.key}</span>
                
                <span className="text-gray-400">Absolute URL:</span>
                <span className="col-span-2 text-gray-800 break-all select-all font-mono">{previewImage.url}</span>
                
                <span className="text-gray-400">File Size:</span>
                <span className="col-span-2 text-gray-800">{formatBytes(previewImage.size)}</span>
                
                <span className="text-gray-400">Uploaded:</span>
                <span className="col-span-2 text-gray-800">{new Date(previewImage.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Single Confirm */}
      <ConfirmationDialog 
        isOpen={!!deleteConfirmKey} 
        onClose={() => setDeleteConfirmKey(null)} 
        onConfirm={handleDeleteConfirm}
        title="Delete Image"
        message="Are you sure you want to permanently delete this image? If this image is linked to any active product, the link reference will be cleared."
      />

      {/* Delete Bulk Confirm */}
      <ConfirmationDialog 
        isOpen={bulkDeleteConfirm} 
        onClose={() => setBulkDeleteConfirm(false)} 
        onConfirm={handleBulkDelete}
        title="Bulk Delete Images"
        message={`Are you sure you want to permanently delete all ${selectedKeys.length} selected images? All associated product references will be set to empty.`}
      />
    </div>
  );
}
