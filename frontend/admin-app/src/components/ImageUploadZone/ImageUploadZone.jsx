import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiTrash2, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiImage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const VIEW_TYPES = [
  { value: 'thumbnail', label: 'Thumbnail (Primary)' },
  { value: 'front', label: 'Front View' },
  { value: 'back', label: 'Back View' },
  { value: 'side', label: 'Side View' },
  { value: 'top', label: 'Top View' },
  { value: 'lifestyle', label: 'Lifestyle Image' },
  { value: 'material', label: 'Material Image' },
  { value: 'dimension', label: 'Dimension Image' },
  { value: 'zoom', label: 'Zoom Image' },
  { value: '360', label: '360 View Image' }
];

export default function ImageUploadZone({ productName, category, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Process selected/dropped files
  const processFiles = (newFilesList) => {
    const validFiles = Array.from(newFilesList).filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      toast.error('Only image files are allowed!');
      return;
    }

    const newFiles = validFiles.map((file, index) => {
      // Intelligently pre-select viewType based on file index
      let defaultView = 'front';
      if (files.length + index === 0) defaultView = 'thumbnail';
      else if (files.length + index === 1) defaultView = 'front';
      else if (files.length + index === 2) defaultView = 'back';
      else if (files.length + index === 3) defaultView = 'side';
      else defaultView = 'lifestyle';

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
        viewType: defaultView,
        progress: 0,
        status: 'idle', // 'idle' | 'uploading' | 'success' | 'error'
        url: ''
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // Trigger file input dialog
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Remove file from list
  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Change view type of specific file
  const changeViewType = (id, viewType) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, viewType } : f));
  };

  // Upload sequential files to S3 mock/real backend
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('No images selected for upload');
      return;
    }

    if (!productName || !category) {
      toast.error('Product Name and Category are required before uploading images');
      return;
    }

    const filesToUpload = files.filter(f => f.status !== 'success');
    if (filesToUpload.length === 0) {
      toast.success('All images are already uploaded');
      return;
    }

    for (let f of filesToUpload) {
      setFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'uploading', progress: 10 } : item));
      
      // Simulate progress indicator
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(item => {
          if (item.id === f.id && item.status === 'uploading' && item.progress < 90) {
            return { ...item, progress: item.progress + 15 };
          }
          return item;
        }));
      }, 200);

      try {
        const formData = new FormData();
        formData.append('image', f.file);
        formData.append('name', productName);
        formData.append('category', category);
        formData.append('viewType', f.viewType);

        const response = await fetch('http://localhost:5000/api/upload/product', {
          method: 'POST',
          body: formData
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Server upload failed');
        }

        const resData = await response.json();
        
        setFiles(prev => prev.map(item => {
          if (item.id === f.id) {
            return {
              ...item,
              status: 'success',
              progress: 100,
              url: resData.data.url
            };
          }
          return item;
        }));
      } catch (err) {
        clearInterval(progressInterval);
        setFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'error', progress: 0 } : item));
        toast.error(`Failed to upload ${f.name}`);
      }
    }

    // Pass uploaded URLs back to parent
    const uploadedUrls = files
      .map(f => f.url)
      .filter(url => url !== '');
      
    const thumbnailObj = files.find(f => f.viewType === 'thumbnail' && f.status === 'success');
    const thumbnailUrl = thumbnailObj ? thumbnailObj.url : (uploadedUrls[0] || '');

    if (onUploadComplete) {
      onUploadComplete({
        images: uploadedUrls,
        thumbnail: thumbnailUrl
      });
    }
    toast.success('Upload process complete!');
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-large p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary-light/10 text-primary scale-[0.99]'
            : 'border-gray-300 hover:border-primary text-gray-500 bg-white'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />
        <FiUploadCloud size={40} className="mb-3 text-gray-400" />
        <span className="text-sm font-bold text-gray-700">Drag & drop product images, or browse</span>
        <span className="text-[10px] text-gray-400 font-semibold uppercase mt-1">Supports PNG, JPG, WEBP (Max 10MB each)</span>
      </div>

      {/* Previews List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-large border border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-black text-gray-800 uppercase">Gallery Previews ({files.length})</span>
            <button
              onClick={uploadFiles}
              className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-large hover:bg-primary-hover transition-colors flex items-center gap-1"
            >
              <FiRefreshCw size={12} className="animate-spin-slow" />
              Upload to S3
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
            {files.map(f => (
              <div key={f.id} className="flex gap-3 bg-white p-2.5 rounded-large border border-gray-100 relative group shadow-sm">
                {/* Image Thumbnail */}
                <div className="w-16 h-16 rounded-large overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                  <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 justify-between min-w-0 pr-6">
                  <span className="text-xs font-bold text-gray-850 truncate">{f.name}</span>
                  
                  {/* Select View Type */}
                  <select
                    value={f.viewType}
                    onChange={(e) => changeViewType(f.id, e.target.value)}
                    disabled={f.status === 'success' || f.status === 'uploading'}
                    className="text-[10px] font-semibold text-gray-650 bg-gray-50 border border-gray-200 rounded p-1 focus:outline-none"
                  >
                    {VIEW_TYPES.map(vt => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>

                  {/* Progress / Status */}
                  {f.status === 'uploading' && (
                    <div className="w-full flex items-center gap-2 mt-1">
                      <div className="h-1.5 bg-gray-200 rounded-full flex-1 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${f.progress}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-gray-400">{f.progress}%</span>
                    </div>
                  )}

                  {f.status === 'success' && (
                    <span className="text-[9px] font-bold text-success flex items-center gap-0.5 mt-1">
                      <FiCheckCircle size={10} /> Uploaded to S3
                    </span>
                  )}

                  {f.status === 'error' && (
                    <span className="text-[9px] font-bold text-danger flex items-center gap-0.5 mt-1">
                      <FiAlertCircle size={10} /> Upload Failed
                    </span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeFile(f.id)}
                  disabled={f.status === 'uploading'}
                  className="absolute right-2 top-2 p-1.5 text-gray-405 hover:text-danger rounded-large hover:bg-red-55/10 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
