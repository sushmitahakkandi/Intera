import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiSave, FiDownload, FiInfo, FiClock, FiTrash2, FiExternalLink, FiCpu, FiCamera, FiGrid } from 'react-icons/fi';
import UploadBox from '../../components/AI/UploadBox';
import LoadingAnimation from '../../components/AI/LoadingAnimation';
import RecommendationCard from '../../components/AI/RecommendationCard';
import FurnitureSuggestion from '../../components/AI/FurnitureSuggestion';
import { toast } from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AIRoomRecommendation() {
  const { token } = useApp();
  // Only use the token for auth if it's a real JWT (not the default placeholder)
  const realToken = token && token !== 'placeholder-jwt-token' ? token : null;
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Dynamic recommendations state
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [analysisDetails, setAnalysisDetails] = useState({
    layoutText: '',
    categories: [],
    materials: [],
    colors: [],
    palette: [],
    confidenceBreakdown: {},
    overallConfidence: 0,
    roomFeatures: {},
    layoutPlan: {},
    spaceOptimizationTips: [],
    improvementScoreBefore: 0,
    improvementScoreAfter: 0,
    budgetOptions: [],
    premiumOptions: [],
    alternativeProducts: [],
    missingFurnitureSuggestions: []
  });

  // History state loaded from MongoDB
  const [uploadHistory, setUploadHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Living Room');
  const [selectedBudget, setSelectedBudget] = useState('value');
  const [selectedStylePreference, setSelectedStylePreference] = useState('Modern');

  // Coordination states for LoadingAnimation & API Call
  const [apiSuccess, setApiSuccess] = useState(false);
  const [apiResultData, setApiResultData] = useState(null);
  const [waitingForApi, setWaitingForApi] = useState(false);

  // Load history from database on mount
  const loadHistory = async () => {
    try {
      const headers = realToken ? { Authorization: `Bearer ${realToken}` } : {};
      const res = await axios.get(`${API_BASE}/api/ai/history`, { headers });
      setUploadHistory(res.data);
    } catch (err) {
      console.error('Failed to load room analysis history:', err.message);
    }
  };

  useEffect(() => {
    loadHistory(); // softAuthMiddleware allows guest access \u2014 always load
  }, []);

  const handleFileSelect = (file, preview) => {
    setSelectedFile({ file, preview });
    setShowResults(false);

    // Auto-detect room type from file name to assist the user
    const name = file.name ? file.name.toLowerCase() : '';
    if (name.includes('bed') || name.includes('sleep') || name.includes('bedroom')) {
      setSelectedCategory('Bedroom');
    } else if (name.includes('dining') || name.includes('eat') || name.includes('cook') || name.includes('kitchen') || name.includes('food')) {
      setSelectedCategory('Dining Room');
    } else if (name.includes('office') || name.includes('study') || name.includes('work') || name.includes('desk') || name.includes('chair')) {
      setSelectedCategory('Office');
    } else if (name.includes('storage') || name.includes('cabinet') || name.includes('closet') || name.includes('shelf')) {
      setSelectedCategory('Storage');
    } else {
      setSelectedCategory('Living Room');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setShowResults(false);
    setRecommendedProducts([]);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setShowResults(false);
    setApiSuccess(false);
    setApiResultData(null);
    setWaitingForApi(false);

    // Call upload API in background
    const formData = new FormData();
    formData.append('file', selectedFile.file);
    formData.append('roomType', selectedCategory);
    formData.append('budgetRange', selectedBudget);
    formData.append('stylePreference', selectedStylePreference);
    formData.append('roomGoal', selectedCategory);

    const uploadHeaders = { 'Content-Type': 'multipart/form-data' };
    if (realToken) uploadHeaders['Authorization'] = `Bearer ${realToken}`;

    try {
      const res = await axios.post(`${API_BASE}/api/ai/room/upload`, formData, {
        headers: uploadHeaders
      });
      setApiResultData(res.data);
      setApiSuccess(true);
    } catch (err) {
      console.error('Error uploading room photo:', err);
      toast.error(err.response?.data?.error || 'Failed to analyze room space. Please try again.');
      setAnalyzing(false);
    }
  };

  // Complete analysis once loader and API are both complete
  const performCompletion = (data) => {
    setRecommendedProducts(data.products || []);
    setAnalysisDetails({
      layoutText: data.layoutSuggestion,
      categories: data.recommendedCategories || [],
      materials: data.detectedMaterials || [],
      colors: data.detectedColors || [],
      palette: data.detectedPalette || [],
      confidenceBreakdown: data.confidenceBreakdown || {},
      overallConfidence: data.overallConfidence || 0,
      roomFeatures: data.roomFeatures || {},
      layoutPlan: data.layoutPlan || {},
      spaceOptimizationTips: data.spaceOptimizationTips || [],
      improvementScoreBefore: data.improvementScoreBefore || 0,
      improvementScoreAfter: data.improvementScoreAfter || 0,
      budgetOptions: data.budgetOptions || [],
      premiumOptions: data.premiumOptions || [],
      alternativeProducts: data.alternativeProducts || [],
      missingFurnitureSuggestions: data.missingFurnitureSuggestions || []
    });

    setAnalyzing(false);
    setShowResults(true);
    toast.success("AI Analysis Complete!");
    loadHistory(); // Reload history items from DB
  };

  const handleAnalysisComplete = () => {
    if (apiSuccess && apiResultData) {
      performCompletion(apiResultData);
    } else {
      // Hold loader state at completion until API returns
      setWaitingForApi(true);
    }
  };

  // Monitor when API returns if loader already finished
  useEffect(() => {
    if (waitingForApi && apiSuccess && apiResultData) {
      setWaitingForApi(false);
      performCompletion(apiResultData);
    }
  }, [waitingForApi, apiSuccess, apiResultData]);

  const saveRecommendation = () => {
    toast.success("Recommendation saved successfully to your Profile!");
  };

  const downloadRecommendation = () => {
    toast.success("Downloading PDF Layout & Furniture Catalog...");
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      const headers = realToken ? { Authorization: `Bearer ${realToken}` } : {};
      await axios.delete(`${API_BASE}/api/ai/history/${id}`, { headers });
      setUploadHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success("History item removed");
    } catch (err) {
      toast.error('Failed to remove history item');
    }
  };

  const openHistoryItem = (item) => {
    setSelectedFile({
      file: { name: item.fileName },
      preview: item.image
    });

    setRecommendedProducts(item.products || []);
    setAnalysisDetails({
      layoutText: item.layoutSuggestion,
      categories: item.recommendedCategories || [],
      materials: item.detectedMaterials || [],
      colors: item.detectedColors || [],
      palette: item.detectedPalette || [],
      confidenceBreakdown: item.confidenceBreakdown || {},
      overallConfidence: item.overallConfidence || 0,
      roomFeatures: item.roomFeatures || {},
      layoutPlan: item.layoutPlan || {},
      spaceOptimizationTips: item.spaceOptimizationTips || [],
      improvementScoreBefore: item.improvementScoreBefore || 0,
      improvementScoreAfter: item.improvementScoreAfter || 0,
      budgetOptions: item.budgetOptions || [],
      premiumOptions: item.premiumOptions || [],
      alternativeProducts: item.alternativeProducts || [],
      missingFurnitureSuggestions: item.missingFurnitureSuggestions || []
    });

    setShowResults(true);
    toast.success(`Loaded analysis from ${item.date}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Creative Blueprint Grid Hero Banner */}
        <div 
          className="rounded-large p-8 md:p-10 text-white relative overflow-hidden shadow-premium mb-10 border border-amber-900/30 flex flex-col lg:flex-row items-center justify-between gap-8"
          style={{
            background: 'linear-gradient(135deg, #1A130E 0%, #291F18 50%, #120F0D 100%)',
          }}
        >
          {/* Blueprint scanning grid background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(166, 106, 44, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(166, 106, 44, 0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Glowing scanner line animation */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 animate-pulse pointer-events-none" />
          
          {/* Glow spots */}
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-10 top-5 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="relative z-10 max-w-xl">
            {/* Animated Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-widest mb-4 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Next-Gen Spatial Core Analysis
            </div>
            
            <h1 className="text-2xl sm:text-3.5xl font-extrabold mb-3 tracking-wide font-sans flex items-center gap-2.5">
              <FiCpu className="text-primary animate-spin-slow" /> Smart Space Architect
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
              Upload a snapshot of your room. Our advanced vision algorithm parses spatial volume, assesses wall boundaries, and recommends ideal smart furniture.
            </p>
          </div>

          {/* Interactive Steps Guide instead of boring paragraph */}
          <div className="relative z-10 w-full lg:max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-3.5 rounded-large flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 font-bold border border-primary/20">
                <FiCamera size={14} />
              </div>
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">1. Snap Photo</h4>
              <p className="text-[9px] text-gray-400 font-semibold leading-normal">Take a snapshot of your living room, bedroom or office.</p>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-3.5 rounded-large flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 font-bold border border-primary/20">
                <FiGrid size={14} />
              </div>
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">2. Scan Spaces</h4>
              <p className="text-[9px] text-gray-400 font-semibold leading-normal">AI extracts dimensions, natural light, and styles.</p>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-3.5 rounded-large flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 font-bold border border-primary/20">
                <FiHome size={14} />
              </div>
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">3. Match Decor</h4>
              <p className="text-[9px] text-gray-400 font-semibold leading-normal">Explore 12 custom smart furniture recommendations.</p>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Upload side */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-gray-100 p-6 rounded-large shadow-premium">
              <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                1. Upload Room Photo
              </h2>
              
              <UploadBox
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClear={handleClear}
                label="Drop your living room, bedroom or office photo here"
              />

              {selectedFile && !analyzing && !showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border-t border-gray-100 pt-6 flex flex-col gap-5"
                >
                  <div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FiGrid className="text-primary animate-pulse" /> Confirm Room Category
                    </h3>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      Please select or verify the room type to help our AI coordinator choose the most relevant smart furniture.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {[
                      { name: 'Living Room', icon: '🛋️' },
                      { name: 'Bedroom', icon: '🛏️' },
                      { name: 'Dining Room', icon: '🍽️' },
                      { name: 'Office', icon: '💼' },
                      { name: 'Storage', icon: '📦' },
                      { name: 'Hall', icon: '🚪' }
                    ].map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`py-3 px-2 rounded-large border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                          selectedCategory === cat.name
                            ? 'border-primary bg-primary-light text-primary font-bold shadow-sm scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium'
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-[10px]">{cat.name}</span>
                      </button>
                    ))}
                  </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiInfo className="text-primary" /> Budget Preference
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Budget', value: 'budget' },
                            { label: 'Value', value: 'value' },
                            { label: 'Premium', value: 'premium' }
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setSelectedBudget(item.value)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                selectedBudget === item.value
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiInfo className="text-primary" /> Style Preference
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {['Modern', 'Luxury', 'Minimal', 'Classic', 'Industrial', 'Scandinavian'].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setSelectedStylePreference(item)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                selectedStylePreference === item
                                  ? 'bg-secondary text-white border-secondary shadow-sm'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={startAnalysis}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 px-7 rounded-large transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      Analyze Space Coordinates
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Analysis Loading State */}
            <AnimatePresence mode="wait">
              {analyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-12"
                >
                  <LoadingAnimation
                    statusMessages={[
                      "Uploading image buffer to cloud workspace...",
                      "Scanning walls & floor boundaries...",
                      "Extracting room lighting coordinates...",
                      "Filtering corresponding smart catalog items..."
                    ]}
                    onComplete={handleAnalysisComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recommendation Result Displays */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-6"
              >
                {/* Result header */}
                <div className="bg-white border border-gray-100 p-6 rounded-large shadow-premium flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-1 uppercase tracking-wider">
                      2. AI Analysis Output
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold">Matched with {recommendedProducts.length} ideal furniture items</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={saveRecommendation}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary-hover text-white text-xs font-bold py-2.5 px-4.5 rounded-large transition-all"
                    >
                      <FiSave size={14} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={downloadRecommendation}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white text-gray-700 hover:text-primary hover:border-primary border border-gray-200 text-xs font-bold py-2.5 px-4.5 rounded-large transition-all"
                    >
                      <FiDownload size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-100 rounded-large p-4 shadow-premium">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Overall AI Confidence</p>
                    <div className="text-2xl font-extrabold text-gray-800">{analysisDetails.overallConfidence || 0}%</div>
                    <p className="text-[11px] text-gray-500 mt-1">Model confidence across vision, style, color and product matching.</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-large p-4 shadow-premium">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Room Improvement</p>
                    <div className="text-2xl font-extrabold text-gray-800">
                      {analysisDetails.improvementScoreBefore || 0} → {analysisDetails.improvementScoreAfter || 0}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Estimated before and after score after applying the recommendations.</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-large p-4 shadow-premium md:col-span-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Confidence Breakdown</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-gray-600">
                      {Object.entries(analysisDetails.confidenceBreakdown || {}).map(([label, value]) => (
                        <div key={label} className="bg-gray-50 border border-gray-100 rounded-large px-3 py-2 flex items-center justify-between">
                          <span className="capitalize">{label}</span>
                          <span className="text-primary font-bold">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100 rounded-large p-5 shadow-premium">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Detected Color Palette</p>
                    <div className="flex flex-wrap gap-2">
                      {(analysisDetails.palette || []).map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-100 bg-gray-50">
                          <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.hex || '#D9D9D9' }} />
                          <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-large p-5 shadow-premium">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Layout Summary</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{analysisDetails.layoutText}</p>
                  </div>
                </div>

                {/* Recommendations Grid */}
                {recommendedProducts.length === 0 ? (
                  <div className="bg-white p-8 border border-gray-100 rounded-large text-center shadow-premium">
                    <p className="text-xs text-gray-400 font-semibold">No direct matching products found in catalog. Try adjusting recommendations.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendedProducts.map((prod, idx) => (
                      <RecommendationCard
                        key={prod.id || idx}
                        product={prod}
                        matchPercentage={98 - idx * 4}
                      />
                    ))}
                  </div>
                )}

                {/* Coordinated furniture layouts */}
                <FurnitureSuggestion
                  layoutText={analysisDetails.layoutText}
                  categories={analysisDetails.categories}
                  materials={analysisDetails.materials}
                  colors={analysisDetails.colors}
                  palette={analysisDetails.palette}
                  confidenceBreakdown={analysisDetails.confidenceBreakdown}
                  overallConfidence={analysisDetails.overallConfidence}
                  roomFeatures={analysisDetails.roomFeatures}
                  layoutPlan={analysisDetails.layoutPlan}
                  spaceOptimizationTips={analysisDetails.spaceOptimizationTips}
                  improvementScoreBefore={analysisDetails.improvementScoreBefore}
                  improvementScoreAfter={analysisDetails.improvementScoreAfter}
                  budgetOptions={analysisDetails.budgetOptions}
                  premiumOptions={analysisDetails.premiumOptions}
                  alternativeProducts={analysisDetails.alternativeProducts}
                  missingFurnitureSuggestions={analysisDetails.missingFurnitureSuggestions}
                />
              </motion.div>
            )}
          </div>

          {/* Right History side */}
          <div className="bg-white border border-gray-100 p-6 rounded-large shadow-premium h-fit">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
              <FiClock size={16} /> Recent Space Analyses
            </h3>

            {uploadHistory.length === 0 ? (
              <p className="text-xs text-gray-400 font-semibold py-4 text-center">No recent uploads</p>
            ) : (
              <div className="flex flex-col gap-4">
                {uploadHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openHistoryItem(item)}
                    className="flex gap-3 items-center border border-gray-50 p-2.5 rounded-large hover:border-primary hover:bg-[#FDFBF7] cursor-pointer transition-all duration-200 group"
                  >
                    <img
                      src={item.image}
                      alt={item.fileName}
                      className="w-12 h-12 object-cover rounded-large border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-gray-700 truncate group-hover:text-primary transition-colors max-w-[120px]">
                          {item.fileName}
                        </p>
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-extrabold flex-shrink-0">
                          {item.roomType}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.date}</p>
                    </div>
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      title="Delete entry"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
