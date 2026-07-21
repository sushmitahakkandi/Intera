import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiX, FiImage, FiCheckCircle, FiAlertCircle, FiCamera } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function UploadBox({ onFileSelect, selectedFile, onClear, accept = "image/*", label = "Upload wall or room image" }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        onFileSelect(file, previewUrl);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    }
  };

  const triggerInput = () => {
    fileInputRef.current.click();
  };

  // Helper to load sample room images directly
  const loadSampleRoom = async (url, fileName) => {
    const loadingToast = toast.loading(`Loading sample ${fileName}...`);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      const preview = URL.createObjectURL(file);
      onFileSelect(file, preview);
      toast.dismiss(loadingToast);
      toast.success(`${fileName} loaded! Click 'Analyze' to scan.`);
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to load sample image. Please upload your own room photo.");
    }
  };

  const samples = [
    {
      name: "Modern Living Room",
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&h=300&q=80",
      file: "sample_living_room.jpg"
    },
    {
      name: "Cozy Bedroom Loft",
      url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&h=300&q=80",
      file: "sample_bedroom.jpg"
    }
  ];

  return (
    <div className="w-full">
      {!selectedFile ? (
        <motion.div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          whileHover={{ borderColor: '#A66A2C', backgroundColor: 'rgba(244, 236, 228, 0.02)' }}
          className={`w-full h-72 border-2 border-dashed rounded-large flex flex-col items-center justify-center cursor-pointer transition-all duration-200 p-6 relative ${
            isDragActive ? 'border-primary bg-primary-light/30 scale-[0.99]' : 'border-gray-200 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          
          {/* Radar scanner glow effect */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 animate-pulse" />
          
          <div className="p-4 rounded-full bg-primary-light text-primary mb-4 shadow-sm">
            <FiUploadCloud size={28} />
          </div>
          <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
          <p className="text-xs text-gray-400 font-medium mb-4">Drag and drop your file here, or click to browse</p>
          <button
            type="button"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-6 rounded-large transition-all shadow-sm"
          >
            Browse Files
          </button>
        </motion.div>
      ) : (
        <div className="relative rounded-large overflow-hidden border border-gray-100 shadow-premium bg-white group">
          <img
            src={selectedFile.preview}
            alt="Upload Preview"
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              onClick={triggerInput}
              className="p-3 bg-white text-gray-800 rounded-full hover:bg-gray-100 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all font-semibold text-sm"
              title="Replace Image"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              Replace
            </button>
            <button
              onClick={onClear}
              className="p-3 bg-danger text-white rounded-full hover:bg-red-600 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all font-semibold text-sm"
              title="Remove Image"
            >
              Remove
            </button>
          </div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-gray-100 flex items-center gap-1.5 shadow-sm">
            <FiImage className="text-primary" size={14} />
            <span className="text-[10px] font-bold text-gray-700 max-w-[150px] truncate">{selectedFile.file.name}</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-4 right-4 p-1.5 bg-white text-gray-600 rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            <FiX size={14} />
          </button>
        </div>
      )}
      {!selectedFile && (
        <div className="mt-4">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Or try a sample room:</p>
          <div className="flex gap-2">
            {samples.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => loadSampleRoom(sample.url, sample.file)}
                className="flex-1 text-[11px] font-bold py-2 px-3 border border-gray-200 hover:border-primary hover:text-primary rounded-large bg-white text-gray-600 transition-all text-center"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
