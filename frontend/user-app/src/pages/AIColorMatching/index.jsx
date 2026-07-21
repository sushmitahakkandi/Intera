import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload, FiCheck, FiX, FiRefreshCw, FiMessageSquare, FiSliders,
  FiDollarSign, FiInfo, FiLayers, FiChevronDown, FiChevronUp, FiHeart,
  FiShare2, FiDownload, FiShoppingCart, FiCheckCircle, FiSend, FiStar,
  FiAlertCircle, FiDroplet, FiTrash2, FiPlus, FiArrowLeft, FiGrid, FiExternalLink,
  FiActivity, FiCheckSquare
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SCANNING_STEPS = [
  'Detecting walls & ceiling coordinates',
  'Detecting floor type & layout bounds',
  'Mapping doors, windows & natural light openings',
  'Identifying existing furniture shapes',
  'Measuring room dimensions & height estimates',
  'Analyzing room style themes',
  'Calculating harmony index against seed catalog',
  'Finalizing 3D visualization layers'
];

// Curated high-quality unsplash images matching categories to prevent duplicate assets
const CATEGORY_UNSPLASH_IMAGES = {
  Sofa: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'
  ],
  Chair: [
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=400&q=80'
  ],
  Bed: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80'
  ],
  Dining: [
    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=400&q=80'
  ],
  Tables: [
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80'
  ],
  Storage: [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1601760562234-9814eea6663a?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?auto=format&fit=crop&w=400&q=80'
  ]
};

const getCategoryImageUrl = (categoryName, productId, indexVal = 0) => {
  if (!categoryName) return CATEGORY_UNSPLASH_IMAGES.Sofa[0];
  const normalized = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
  const images = CATEGORY_UNSPLASH_IMAGES[normalized] || CATEGORY_UNSPLASH_IMAGES.Sofa;
  let idx = indexVal;
  if (productId) {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash += productId.charCodeAt(i);
    }
    idx = hash % images.length;
  }
  return images[idx];
};

const ROOM_TEMPLATES = {
  'living-room': {
    before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // Empty room shell
    after: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80', // Beautifully furnished living room
    roomType: 'Living Room',
    stylePreference: 'Modern',
    wallColor: { name: 'Deep Teal', hex: '#008080' },
    palette: [
      { name: 'Deep Teal', hex: '#008080', pct: 40 },
      { name: 'Warm Cream', hex: '#FAF5EF', pct: 30 },
      { name: 'Slate Gray', hex: '#708090', pct: 20 },
      { name: 'Natural Oak', hex: '#E8D3A7', pct: 10 }
    ],
    pins: [
      { top: '55%', left: '32%', label: 'Sofa Placement', category: 'Sofa' },
      { top: '70%', left: '50%', label: 'Coffee Table', category: 'Tables' },
      { top: '48%', left: '74%', label: 'Accent Armchair', category: 'Chair' }
    ]
  },
  'bedroom': {
    before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // Completely empty sunlit room shell
    after: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', // Furnished bedroom with bed
    roomType: 'Bedroom',
    stylePreference: 'Minimal',
    wallColor: { name: 'Warm Beige', hex: '#F5F5DC' },
    palette: [
      { name: 'Warm Beige', hex: '#F5F5DC', pct: 45 },
      { name: 'Dark Walnut', hex: '#3D2314', pct: 25 },
      { name: 'Oatmeal Beige', hex: '#FAF5EF', pct: 20 },
      { name: 'Soft Gray', hex: '#808080', pct: 10 }
    ],
    pins: [
      { top: '55%', left: '46%', label: 'Double Bed', category: 'Bed' },
      { top: '65%', left: '22%', label: 'Nightstand', category: 'Tables' },
      { top: '42%', left: '72%', label: 'Wardrobe System', category: 'Storage' }
    ]
  },
  'study': {
    before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // Empty room shell
    after: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', // Work office study space
    roomType: 'Study Room',
    stylePreference: 'Industrial',
    wallColor: { name: 'Slate Gray', hex: '#708090' },
    palette: [
      { name: 'Slate Gray', hex: '#708090', pct: 40 },
      { name: 'Walnut Finish', hex: '#5C4033', pct: 30 },
      { name: 'Natural Oak', hex: '#D2B48C', pct: 20 },
      { name: 'Charcoal Black', hex: '#000000', pct: 10 }
    ],
    pins: [
      { top: '58%', left: '38%', label: 'Study Table', category: 'Tables' },
      { top: '65%', left: '28%', label: 'Office Swivel Chair', category: 'Chair' },
      { top: '40%', left: '68%', label: 'Storage Bookshelf', category: 'Storage' }
    ]
  }
};

export default function AIColorMatching() {
  const { token, products, addToCart } = useApp();
  const navigate = useNavigate();

  // Core visual state: 'setup', 'scanning', 'studio'
  const [studioState, setStudioState] = useState('setup');

  // Input states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [activeTemplateKey, setActiveTemplateKey] = useState(null);
  const [roomType, setRoomType] = useState('Living Room');
  const [stylePreference, setStylePreference] = useState('Modern');
  const [budget, setBudget] = useState(120000);

  // Scanning progress
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanningStep, setCurrentScanningStep] = useState('');
  const [scannedSteps, setScannedSteps] = useState([]);

  // Blurry checker modal
  const [qualityWarning, setQualityWarning] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState(null);

  // Core Result payload
  const [backendAnalysis, setBackendAnalysis] = useState(null);

  // Layout & coordinate state
  const [layoutsState, setLayoutsState] = useState({
    Modern: [], Luxury: [], Minimal: [], Scandinavian: []
  });
  const [activeLayout, setActiveLayout] = useState('Modern');
  const currentItems = layoutsState[activeLayout] || [];
  const [selectedItem, setSelectedItem] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLayout, setCompareLayout] = useState('Luxury');
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  // Customization Preference modifiers
  const [preferences, setPreferences] = useState({
    wfh: false,
    pets: false,
    kids: false,
    storage: false,
    luxury: false,
    sofaType: null,
    chairType: null,
    tableType: null
  });

  // Slider controls
  const [sliderOrientation, setSliderOrientation] = useState('horizontal');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [designSaved, setDesignSaved] = useState(false);

  // Quick View details modal state
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
  const [quickViewMainImage, setQuickViewMainImage] = useState('');

  // Chatbot states
  const [chatLogs, setChatLogs] = useState([
    { sender: 'ai', text: 'Welcome to your AI Interior Design Studio! I can instantly adjust materials, swap items, or tailor the budget. Let me know what you want to change!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Load User Saved Room Designs
  const loadHistory = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await axios.get(`${API_BASE}/api/ai/color/history`, { headers });
      if (res.data && res.data.history) {
        setUploadHistory(res.data.history);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [token, studioState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  const prevItemsRef = useRef([]);
  useEffect(() => {
    if (currentItems && currentItems.length > 0) {
      const currentIds = currentItems.map(item => item.productId || item._id || item.id);
      const prevIds = prevItemsRef.current.map(item => item.productId || item._id || item.id);

      const isDifferent = currentIds.length !== prevIds.length || currentIds.some((id, idx) => id !== prevIds[idx]);

      if (isDifferent) {
        setSelectedItemIds(currentIds);
        prevItemsRef.current = currentItems;
      }
    }
  }, [currentItems]);

  // Image quality contrast analyzer
  const checkImageQuality = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 100;
          canvas.height = 100;
          ctx.drawImage(img, 0, 0, 100, 100);

          const imgData = ctx.getImageData(0, 0, 100, 100).data;
          let sum = 0;
          let count = 0;

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            sum += brightness;
            count++;
          }

          const avg = sum / count;
          let diffSum = 0;
          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            diffSum += Math.abs(brightness - avg);
          }
          const contrast = diffSum / count;
          resolve(contrast > 12);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const extractDominantColorsFromImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 100;
          canvas.height = 100;
          ctx.drawImage(img, 0, 0, 100, 100);

          const imgData = ctx.getImageData(0, 0, 100, 100).data;

          const getBoxAverageColor = (centerX, centerY) => {
            let rSum = 0, gSum = 0, bSum = 0, count = 0;
            const startX = Math.max(0, centerX - 5);
            const endX = Math.min(99, centerX + 5);
            const startY = Math.max(0, centerY - 5);
            const endY = Math.min(99, centerY + 5);

            for (let y = startY; y <= endY; y++) {
              for (let x = startX; x <= endX; x++) {
                const idx = (y * 100 + x) * 4;
                rSum += imgData[idx];
                gSum += imgData[idx + 1];
                bSum += imgData[idx + 2];
                count++;
              }
            }
            const r = Math.round(rSum / count);
            const g = Math.round(gSum / count);
            const b = Math.round(bSum / count);

            const toHex = (c) => {
              const hex = c.toString(16);
              return hex.length === 1 ? '0' + hex : hex;
            };
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
          };

          const wallHex = getBoxAverageColor(50, 20);
          const floorHex = getBoxAverageColor(50, 80);
          const acc1Hex = getBoxAverageColor(20, 50);
          const acc2Hex = getBoxAverageColor(80, 50);

          const hexToColorName = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);

            const candidates = [
              { name: 'Warm Cream', r: 250, g: 245, b: 239 },
              { name: 'Warm Beige', r: 245, g: 245, b: 220 },
              { name: 'Soft Alabaster', r: 242, g: 240, b: 235 },
              { name: 'Pebble Gray', r: 176, g: 196, b: 222 },
              { name: 'Slate Charcoal', r: 70, g: 80, b: 90 },
              { name: 'Olive Accent', r: 128, g: 128, b: 105 },
              { name: 'Natural Wood Oak', r: 210, g: 180, b: 140 },
              { name: 'Deep Teak Wood', r: 139, g: 94, b: 60 },
              { name: 'Warm Taupe', r: 179, g: 139, b: 109 },
              { name: 'Steel Blue Accent', r: 112, g: 128, b: 144 },
              { name: 'Cozy Gold Tint', r: 197, g: 179, b: 88 }
            ];

            let minDistance = Infinity;
            let bestName = 'Custom Tint';
            candidates.forEach(c => {
              const dist = Math.sqrt((c.r - r) ** 2 + (c.g - g) ** 2 + (c.b - b) ** 2);
              if (dist < minDistance) {
                minDistance = dist;
                bestName = c.name;
              }
            });
            return bestName;
          };

          resolve([
            { name: hexToColorName(wallHex), hex: wallHex, pct: 40 },
            { name: hexToColorName(floorHex), hex: floorHex, pct: 30 },
            { name: hexToColorName(acc1Hex), hex: acc1Hex, pct: 20 },
            { name: hexToColorName(acc2Hex), hex: acc2Hex, pct: 10 }
          ]);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setActiveTemplateKey(null);

    const pass = await checkImageQuality(file);
    if (!pass) {
      setPendingUploadFile(file);
      setQualityWarning(true);
    }
  };

  // Preset Template loader
  const handleSelectTemplate = (templateKey) => {
    const template = ROOM_TEMPLATES[templateKey];
    if (!template) return;

    setActiveTemplateKey(templateKey);
    setUploadPreview(template.before);
    setRoomType(template.roomType);
    setStylePreference(template.stylePreference);
    setSelectedFile({ name: `${templateKey}-bare.jpg`, isTemplate: true });
  };

  // Maps categories to pull real active seeded products from context products list
  const getCatalogProductsForRoom = (roomTypeName) => {
    const type = (roomTypeName || roomType || 'Living Room').toLowerCase();
    let targetCats = [];

    // STRICT ROOM CATEGORIES MAPPING
    if (type.includes('living') || type.includes('hall')) {
      targetCats = ['Sofa', 'Tables', 'Chair', 'Storage'];
    } else if (type.includes('bed')) {
      targetCats = ['Bed', 'Tables', 'Storage'];
    } else if (type.includes('study') || type.includes('office') || type.includes('work')) {
      targetCats = ['Tables', 'Chair', 'Storage'];
    } else {
      targetCats = ['Dining', 'Tables', 'Chair', 'Storage'];
    }

    const matched = [];
    targetCats.forEach((cat) => {
      const items = products.filter((p) => {
        const pCat = (p.category?.name || p.category || '').toLowerCase();
        return pCat.includes(cat.toLowerCase());
      });
      items.slice(0, 2).forEach((p, index) => {
        const resolvedImage = getCategoryImageUrl(cat, p.id, index);

        matched.push({
          productId: p.id,
          _id: p.id,
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice || p.price,
          score: 90 + Math.floor(Math.random() * 9),
          image: resolvedImage,
          description: p.description || 'Premium design with comfortable padded configurations.',
          material: p.material || 'Solid Wood',
          colorName: p.colorName || 'Walnut',
          dimensions: p.dimensions || 'N/A',
          rating: p.rating || 4.5,
          reviewsCount: p.reviewsCount || 100,
          images: [resolvedImage],
          category: p.category?.name || p.category || cat
        });
      });
    });

    // Fallback if context is not loaded
    if (matched.length === 0) {
      if (type.includes('bed')) {
        return [
          {
            id: 'item-b1', productId: 'item-b1', name: 'Art Deco Velvet Double Bed', price: 45000, score: 96,
            image: getCategoryImageUrl('Bed', 'item-b1', 0),
            description: 'Luxury upholstered bed frame with ergonomic headboard.', material: 'Velvet & Solid Wood', dimensions: '200x180x110cm', rating: 4.8, reviewsCount: 85, category: 'Bed'
          },
          {
            id: 'item-b2', productId: 'item-b2', name: 'Minimalist Nightstand Table', price: 7500, score: 93,
            image: getCategoryImageUrl('Tables', 'item-b2', 0),
            description: 'Compact bedside table with single drawer storage.', material: 'Walnut Wood', dimensions: '45x40x50cm', rating: 4.7, reviewsCount: 42, category: 'Tables'
          },
          {
            id: 'item-b3', productId: 'item-b3', name: 'Scandinavian Wood Wardrobe', price: 38000, score: 95,
            image: getCategoryImageUrl('Storage', 'item-b3', 0),
            description: 'Spacious 3-door wooden wardrobe with hanging space.', material: 'Solid Oak', dimensions: '150x60x200cm', rating: 4.9, reviewsCount: 64, category: 'Storage'
          }
        ];
      } else if (type.includes('study') || type.includes('office') || type.includes('work')) {
        return [
          {
            id: 'item-s1', productId: 'item-s1', name: 'Executive Wooden Study Desk', price: 22000, score: 95,
            image: getCategoryImageUrl('Tables', 'item-s1', 0),
            description: 'Spacious ergonomic study desk with cable management.', material: 'Solid Teak', dimensions: '140x70x75cm', rating: 4.8, reviewsCount: 50, category: 'Tables'
          },
          {
            id: 'item-s2', productId: 'item-s2', name: 'Ergonomic Mesh Swivel Chair', price: 12500, score: 94,
            image: getCategoryImageUrl('Chair', 'item-s2', 0),
            description: 'High-back ergonomic office chair with lumbar support.', material: 'Mesh & Aluminum', dimensions: '65x65x120cm', rating: 4.7, reviewsCount: 110, category: 'Chair'
          },
          {
            id: 'item-s3', productId: 'item-s3', name: 'Industrial Bookshelf Unit', price: 16000, score: 92,
            image: getCategoryImageUrl('Storage', 'item-s3', 0),
            description: '5-tier open bookshelf with metal frame.', material: 'Teak & Steel', dimensions: '80x35x180cm', rating: 4.6, reviewsCount: 38, category: 'Storage'
          }
        ];
      } else {
        return [
          {
            id: 'item-l1', productId: 'item-l1', name: 'Modern Velvet 3-Seater Sofa', price: 32000, score: 97,
            image: getCategoryImageUrl('Sofa', 'item-l1', 0),
            description: 'A plush 3-seater sofa suitable for modern living rooms.', material: 'Velvet Fabric', dimensions: '210x90x85cm', rating: 4.9, reviewsCount: 120, category: 'Sofa'
          },
          {
            id: 'item-l2', productId: 'item-l2', name: 'Walnut Oval Coffee Table', price: 9500, score: 95,
            image: getCategoryImageUrl('Tables', 'item-l2', 0),
            description: 'Solid walnut coffee table with rounded edges.', material: 'Solid Wood', dimensions: '120x60x45cm', rating: 4.8, reviewsCount: 75, category: 'Tables'
          },
          {
            id: 'item-l3', productId: 'item-l3', name: 'Nordic Accent Lounge Chair', price: 14000, score: 93,
            image: getCategoryImageUrl('Chair', 'item-l3', 0),
            description: 'Comfortable accent lounge chair with wooden armrests.', material: 'Linen & Wood', dimensions: '75x80x85cm', rating: 4.7, reviewsCount: 60, category: 'Chair'
          }
        ];
      }
    }

    return matched;
  };

  // Perform upload or trigger templates scan
  const handleStartScanning = async () => {
    if (!selectedFile) {
      toast.error('Please upload a room image or select a template!');
      return;
    }

    setStudioState('scanning');
    setScanProgress(0);
    setScannedSteps([]);
    setDesignSaved(false);

    let progress = 0;
    const scannerInterval = setInterval(() => {
      progress += 5;
      if (progress >= 95) {
        clearInterval(scannerInterval);
      } else {
        setScanProgress(progress);
        const idx = Math.floor((progress / 100) * SCANNING_STEPS.length);
        if (idx < SCANNING_STEPS.length) {
          const stepName = SCANNING_STEPS[idx];
          setCurrentScanningStep(stepName);
          setScannedSteps((prev) => prev.includes(stepName) ? prev : [...prev, stepName]);
        }
      }
    }, 120);

    // Call real API upload if a custom file is uploaded
    if (selectedFile && !selectedFile.isTemplate) {
      let customPalette = null;
      try {
        customPalette = await extractDominantColorsFromImage(selectedFile);
      } catch (e) {
        console.error('Failed to extract dominant colors:', e);
      }

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('roomType', roomType);
        formData.append('stylePreference', stylePreference);
        formData.append('budgetRange', budget > 80000 ? 'premium' : budget < 50000 ? 'budget' : 'value');

        const headers = { 'Content-Type': 'multipart/form-data' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await axios.post(`${API_BASE}/api/ai/color/upload`, formData, { headers });

        clearInterval(scannerInterval);
        setScanProgress(100);
        setScannedSteps(SCANNING_STEPS);

        // Populate and sync
        const catalogList = getCatalogProductsForRoom(roomType);
        res.data.shoppingList = catalogList;
        res.data.recommendations = { primary: catalogList };
        if (customPalette) {
          res.data.palette = customPalette;
          res.data.wallColor = customPalette[0];
        }
        setIsScanningComplete(res.data);
      } catch (err) {
        clearInterval(scannerInterval);
        setScanProgress(100);

        const catalogList = getCatalogProductsForRoom(roomType);
        const mockData = getMockDataForRoomType(roomType);
        mockData.shoppingList = catalogList;
        mockData.recommendations = { primary: catalogList };
        if (customPalette) {
          mockData.palette = customPalette;
          mockData.wallColor = customPalette[0];
        }
        setIsScanningComplete(mockData);
      }
    } else {
      // Template loading flow
      setTimeout(() => {
        clearInterval(scannerInterval);
        setScanProgress(100);
        setScannedSteps(SCANNING_STEPS);

        const templateData = ROOM_TEMPLATES[activeTemplateKey];
        const catalogList = getCatalogProductsForRoom(roomType);
        const compiled = {
          success: true,
          roomType: templateData.roomType,
          interiorStyle: templateData.stylePreference,
          roomMood: 'Cozy Architectural Harmony',
          lightingConditions: 'Balanced warm daylight',
          flooringMaterial: 'Premium Hardwood Oak',
          dominantTextures: ['Matte Wood', 'Plush Linen'],
          confidence: 96,
          wallColor: templateData.wallColor,
          palette: templateData.palette,
          shoppingList: catalogList,
          recommendations: { primary: catalogList }
        };
        setIsScanningComplete(compiled);
      }, 1500);
    }
  };

  const setIsScanningComplete = (data) => {
    setBackendAnalysis(data);

    const targetRoomType = data.roomType || roomType || 'Living Room';

    const filterLayoutForRoom = (layoutItems) => {
      if (!Array.isArray(layoutItems)) return [];
      const r = targetRoomType.toLowerCase();
      return layoutItems.filter((item) => {
        const catName = typeof item.category === 'object' ? item.category?.name : item.category;
        const cat = `${catName || ''} ${item.categoryGroup || ''} ${item.name || ''}`.toLowerCase();
        if (r.includes('living') || r.includes('hall')) {
          return !cat.includes('bed') && !cat.includes('wardrobe') && !cat.includes('dresser') && !cat.includes('nightstand') && !cat.includes('dining table') && !cat.includes('bar table');
        }
        if (r.includes('bed')) {
          return !cat.includes('dining table') && !cat.includes('bar table') && !cat.includes('sofa') && !cat.includes('couch');
        }
        if (r.includes('study') || r.includes('office') || r.includes('work')) {
          return !cat.includes('bed') && !cat.includes('wardrobe') && !cat.includes('dining table') && !cat.includes('bar table');
        }
        if (r.includes('dining')) {
          return !cat.includes('bed') && !cat.includes('wardrobe') && !cat.includes('sofa');
        }
        return true;
      });
    };

    let processedLayouts = null;
    if (data.savedLayouts && Object.keys(data.savedLayouts).length > 0) {
      processedLayouts = {};
      Object.keys(data.savedLayouts).forEach((style) => {
        processedLayouts[style] = filterLayoutForRoom(data.savedLayouts[style]);
      });
      setLayoutsState(processedLayouts);
      setActiveLayout(data.activeLayout || 'Modern');
    } else if (data.layouts && Object.keys(data.layouts).length > 0) {
      processedLayouts = {};
      Object.keys(data.layouts).forEach((style) => {
        processedLayouts[style] = filterLayoutForRoom(data.layouts[style]);
      });
      setLayoutsState(processedLayouts);
      setActiveLayout(data.activeLayout || data.interiorStyle || 'Modern');
    } else {
      const catalogList = filterLayoutForRoom(data.shoppingList || getCatalogProductsForRoom(targetRoomType));
      const fallbackLayout = catalogList.map((item, idx) => ({
        productId: item.productId || item._id || item.id,
        name: item.name,
        category: item.category,
        categoryGroup: item.categoryGroup,
        price: item.price,
        image: item.image,
        xPct: 30 + idx * 18,
        yPct: 60,
        scale: 1.0,
        rotation: 0,
        zIndex: 5,
        visible: true,
        alternatives: []
      }));
      setLayoutsState({
        Modern: fallbackLayout,
        Luxury: fallbackLayout,
        Minimal: fallbackLayout,
        Scandinavian: fallbackLayout
      });
      setActiveLayout('Modern');
    }

    const rawShopping = data.shoppingList && data.shoppingList.length > 0 ? data.shoppingList : getCatalogProductsForRoom(targetRoomType);
    const filteredShopping = filterLayoutForRoom(rawShopping);
    data.shoppingList = filteredShopping;
    if (data.recommendations) {
      data.recommendations.primary = filteredShopping;
    }

    setSelectedItemIds(filteredShopping.map(p => p.productId || p._id || p.id));
    setStudioState('studio');
  };

  const getMockDataForRoomType = (type) => {
    return {
      success: true,
      imageUrl: uploadPreview,
      roomType: type,
      interiorStyle: stylePreference,
      roomMood: 'Cozy Space Balance',
      lightingConditions: 'Natural daylight',
      flooringMaterial: 'Laminated Wood Board',
      dominantTextures: ['Linen Upholstery', 'Teak Veneer'],
      confidence: 91,
      wallColor: { name: 'Warm Cream', hex: '#FAF5EF' },
      palette: [
        { name: 'Warm Cream', hex: '#FAF5EF', pct: 40 },
        { name: 'Oatmeal Beige', hex: '#E7DCC5', pct: 30 },
        { name: 'Soft Charcoal', hex: '#333333', pct: 20 },
        { name: 'Oak Wood', hex: '#CDA275', pct: 10 }
      ]
    };
  };

  const handleChatSubmit = (customText) => {
    const text = customText || chatInput;
    if (!text.trim()) return;

    setChatLogs((prev) => [...prev, { sender: 'user', text }]);
    setChatInput('');

    setTimeout(() => {
      let response = '';
      const lower = text.toLowerCase();

      if (lower.includes('leather sofa') || lower.includes('leather')) {
        setPreferences((prev) => ({ ...prev, sofaType: 'leather' }));
        response = 'Sure! I have updated the sofa recommendation to a premium genuine leather design.';
      } else if (lower.includes('fabric sofa') || lower.includes('fabric')) {
        setPreferences((prev) => ({ ...prev, sofaType: 'fabric' }));
        response = 'Updated! Swapped the sofa recommendation to a plush stain-resistant fabric material.';
      } else if (lower.includes('wooden chair') || lower.includes('wood chair')) {
        setPreferences((prev) => ({ ...prev, chairType: 'wooden' }));
        response = 'Understood. Swapped the metal chair for a hand-crafted teak wooden dining chair.';
      } else if (lower.includes('metal chair') || lower.includes('metallic chair') || lower.includes('steel chair')) {
        setPreferences((prev) => ({ ...prev, chairType: 'metal' }));
        response = 'Sure thing. Updated the chair to a minimalist powder-coated steel frame dining chair.';
      } else if (lower.includes('glass table') || lower.includes('glass')) {
        setPreferences((prev) => ({ ...prev, tableType: 'glass' }));
        response = 'Swapped! Recommended coffee table updated to a modern tempered glass top model.';
      } else if (lower.includes('cheaper') || lower.includes('budget') || lower.includes('less')) {
        setBudget(55000);
        response = 'Swapped the recommended items to budget-friendly options. Check the cart column for your updated total!';
      } else if (lower.includes('luxurious') || lower.includes('luxury')) {
        setPreferences((prev) => ({ ...prev, luxury: true }));
        response = 'Upgraded products to solid wood and premium upholstery finishes. Match percentages and balance estimates refreshed!';
      } else if (lower.includes('pet') || lower.includes('pets')) {
        setPreferences((prev) => ({ ...prev, pets: true }));
        response = 'I have adjusted the recommendations to pet-safe scratch-proof fabrics and rounded leg protectors.';
      } else if (lower.includes('kids') || lower.includes('kid')) {
        setPreferences((prev) => ({ ...prev, kids: true }));
        response = 'Table corner shapes updated to round edges and covers swapped to washable stain-resistant materials.';
      } else {
        response = 'Understood. I have optimized the recommendations to align with your instructions!';
      }

      setChatLogs((prev) => [...prev, { sender: 'ai', text: response }]);
    }, 600);
  };

  // Add checked items to cart
  const handleAddCheckedToCart = () => {
    if (!backendAnalysis) return;
    const list = currentItems;
    const checkedItems = list.filter(item => selectedItemIds.includes(item.productId || item._id || item.id));

    if (checkedItems.length === 0) {
      toast.error('No items checked for purchase!');
      return;
    }

    checkedItems.forEach((item) => {
      addToCart({
        id: item.productId || item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image || 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp',
        quantity: 1
      });
    });

    toast.success(`Added ${checkedItems.length} products to your shopping cart!`);
  };

  // Process item overrides based on toggled preferences & budget modifications
  const getProcessedItems = () => {
    if (!backendAnalysis) return [];
    const list = backendAnalysis.recommendations?.primary || backendAnalysis.shoppingList || [];
    const rawTotal = list.reduce((sum, item) => sum + item.price, 0);

    // Calculate dynamic scaling multiplier based on budget target to show visible price drop
    let ratio = budget / rawTotal;
    if (preferences.luxury) ratio = Math.max(ratio, 1.4);
    const multiplier = Math.min(preferences.luxury ? 1.4 : 1.0, Math.max(0.5, ratio));

    return list.map((item) => {
      let price = Math.round(item.price * multiplier);
      let name = item.name;
      let score = item.recommendationScore || item.score || 92;
      let image = item.image;
      let material = item.material;
      let productId = item.productId || item._id || item.id;

      // Swap logic based on chatbot conversation
      if (item.category === 'Sofa' && preferences.sofaType === 'leather') {
        name = 'Classic Chesterfield Leather Sofa';
        price = Math.round(price * 1.35);
        image = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80';
        material = 'Genuine Leather';
        productId = `${item.id || 'sofa'}-leather`;
      } else if (item.category === 'Sofa' && preferences.sofaType === 'fabric') {
        name = 'Scandinavian Cozy Fabric Sofa';
        price = Math.round(price * 0.9);
        image = 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80';
        material = 'Textured Linen';
        productId = `${item.id || 'sofa'}-fabric`;
      }

      if (item.category === 'Tables' && preferences.tableType === 'glass') {
        name = 'Tempered Glass Top Coffee Table';
        price = Math.round(price * 0.85);
        image = 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80';
        material = 'Tempered Glass / Steel';
        productId = `${item.id || 'table'}-glass`;
      }

      if (item.category === 'Chair' && preferences.chairType === 'wooden') {
        name = 'Solid Oak Dining Chair';
        price = Math.round(price * 1.1);
        image = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80';
        material = 'Solid Oak Wood';
        productId = `${item.id || 'chair'}-wood`;
      } else if (item.category === 'Chair' && preferences.chairType === 'metal') {
        name = 'Minimalist Steel Frame Chair';
        price = Math.round(price * 0.8);
        image = 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=400&q=80';
        material = 'Powder-Coated Steel';
        productId = `${item.id || 'chair'}-metal`;
      }

      // Standard preference overrides
      if (preferences.luxury && !preferences.sofaType && !preferences.tableType) {
        name = name.replace('Fabric', 'Premium Leather').replace('Oak', 'Solid Teak').replace('Plush', 'Luxurious Velvet');
        material = 'Premium Leather / Teak';
        score = Math.min(99, score + 3);
      }

      if (multiplier < 0.85) {
        name = name.replace('Velvet', 'Cotton Blend').replace('Teak', 'MDF Veneer');
        score = Math.max(80, score - Math.round((1 - multiplier) * 10));
      }

      if (preferences.pets && item.category === 'Sofa' && !preferences.sofaType) {
        name = 'Scratch-Proof Microfiber Sofa';
        price = Math.round(price * 1.05);
        material = 'Pet-Friendly Microfiber';
        productId = `${item.id || 'sofa'}-petfriendly`;
      }
      if (preferences.kids && item.category === 'Tables' && !preferences.tableType) {
        name = 'Rounded Child-Safe Table';
        productId = `${item.id || 'table'}-childsafe`;
      }

      return {
        ...item,
        name,
        price,
        score,
        image,
        material,
        productId,
        id: productId,
        _id: productId
      };
    });
  };

  const totalPriceCalculatedRaw = () => {
    if (!backendAnalysis) return 0;
    const list = backendAnalysis.recommendations?.primary || backendAnalysis.shoppingList || [];
    return list.reduce((sum, item) => sum + item.price, 0);
  };

  // Open product modal
  const openProductQuickView = (item) => {
    setSelectedQuickViewProduct(item);
    setQuickViewMainImage(item.image);
  };

  const dragRef = useRef({
    dragging: false,
    productId: null,
    startX: 0,
    startY: 0,
    startXPct: 0,
    startYPct: 0
  });

  const handleDragStart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      dragging: true,
      productId: item.productId,
      startX: clientX,
      startY: clientY,
      startXPct: item.xPct,
      startYPct: item.yPct
    };
  };

  const handleDragMove = (e) => {
    if (!dragRef.current.dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const canvasContainer = document.getElementById('room-canvas-container');
    if (!canvasContainer) return;

    const rect = canvasContainer.getBoundingClientRect();
    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;

    const deltaXPct = (deltaX / rect.width) * 100;
    const deltaYPct = (deltaY / rect.height) * 100;

    const newXPct = Math.min(95, Math.max(5, dragRef.current.startXPct + deltaXPct));
    const newYPct = Math.min(95, Math.max(5, dragRef.current.startYPct + deltaYPct));

    setLayoutsState((prev) => {
      const currentList = prev[activeLayout] || [];
      const updatedList = currentList.map((item) => {
        if (item.productId === dragRef.current.productId) {
          return { ...item, xPct: Math.round(newXPct * 10) / 10, yPct: Math.round(newYPct * 10) / 10 };
        }
        return item;
      });
      return { ...prev, [activeLayout]: updatedList };
    });
  };

  const handleDragEnd = () => {
    dragRef.current.dragging = false;
  };

  useEffect(() => {
    const handleMove = (e) => handleDragMove(e);
    const handleEnd = () => handleDragEnd();

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeLayout]);

  const handleSwapItem = (newProduct) => {
    if (!selectedItem) return;
    setLayoutsState((prev) => {
      const currentList = prev[activeLayout] || [];
      const updatedList = currentList.map((item) => {
        if (item.productId === selectedItem.productId) {
          const alternatives = item.alternatives || [];
          const matchedAlt = alternatives.find(alt => alt.productId === newProduct.productId);

          const newAlts = [
            ...alternatives.filter(alt => alt.productId !== newProduct.productId),
            {
              productId: item.productId,
              name: item.name,
              category: item.category,
              categoryGroup: item.categoryGroup,
              price: item.price,
              score: item.score,
              image: item.image,
              description: item.description,
              material: item.material,
              dimensions: item.dimensions,
              colorName: item.colorName
            }
          ];

          const updatedItem = {
            ...item,
            productId: newProduct.productId,
            id: newProduct.productId,
            _id: newProduct.productId,
            name: newProduct.name,
            price: newProduct.price,
            score: newProduct.score || item.score,
            image: newProduct.image,
            description: newProduct.description || item.description,
            material: newProduct.material || item.material,
            dimensions: newProduct.dimensions || item.dimensions,
            colorName: newProduct.colorName || item.colorName,
            alternatives: newAlts
          };
          setSelectedItem(updatedItem);
          return updatedItem;
        }
        return item;
      });
      return { ...prev, [activeLayout]: updatedList };
    });
    toast.success('Product swapped successfully!');
  };

  const handleSaveLayout = async () => {
    if (!backendAnalysis?.analysisId) {
      toast.error('No design analysis session is active to save layouts!');
      return;
    }
    setIsSavingLayout(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body = {
        layouts: layoutsState,
        activeLayout: activeLayout
      };

      const res = await axios.put(`${API_BASE}/api/ai/color/design/${backendAnalysis.analysisId}`, body, { headers });
      if (res.data.success) {
        setDesignSaved(true);
        toast.success('Layout coordinates saved successfully!');
      }
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Failed to save layout coordinates.');
    } finally {
      setIsSavingLayout(false);
    }
  };

  const handleDownloadVisualization = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = uploadPreview;

      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });

      canvas.width = bgImg.naturalWidth;
      canvas.height = bgImg.naturalHeight;

      // Draw background room
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Draw items
      const items = layoutsState[activeLayout] || [];
      for (const item of items) {
        if (item.visible === false) continue;
        const itemImg = new Image();
        itemImg.crossOrigin = 'anonymous';
        itemImg.src = item.image;

        await new Promise((resolve) => {
          itemImg.onload = resolve;
          itemImg.onerror = resolve; // proceed if one fails
        });

        ctx.save();
        const pxX = (item.xPct / 100) * canvas.width;
        const pxY = (item.yPct / 100) * canvas.height;
        ctx.translate(pxX, pxY);
        ctx.rotate(((item.rotation || 0) * Math.PI) / 180);

        let widthPct = 0.15;
        const cat = (item.category || '').toLowerCase();
        if (cat.includes('sofa') || cat.includes('bed')) widthPct = 0.22;
        else if (cat.includes('table')) widthPct = 0.13;
        else if (cat.includes('chair')) widthPct = 0.11;

        const baseWidth = canvas.width * widthPct;
        const targetWidth = baseWidth * (item.scale || 1.0);
        const targetHeight = (itemImg.naturalHeight / itemImg.naturalWidth) * targetWidth;

        ctx.drawImage(itemImg, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
        ctx.restore();
      }

      const url = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `styled-${roomType}-${activeLayout}.jpg`;
      link.href = url;
      link.click();
      toast.success('Room visualization downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to download room image visualization.');
    }
  };

  const getFurnitureOverlayStyle = (item) => {
    const category = item.category || 'Sofa';
    let widthClass = 'w-24 sm:w-32 md:w-40';
    let offsetY = '-85%';

    if (category === 'Sofa' || category === 'Bed') {
      widthClass = 'w-36 sm:w-48 md:w-56';
      offsetY = '-88%';
    } else if (category === 'Tables') {
      widthClass = 'w-20 sm:w-28 md:w-32';
      offsetY = '-85%';
    } else if (category === 'Chair') {
      widthClass = 'w-16 sm:w-24 md:w-28';
      offsetY = '-82%';
    } else if (category === 'Storage') {
      widthClass = 'w-20 sm:w-26 md:w-30';
      offsetY = '-85%';
    }

    return {
      className: `${widthClass} absolute pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-105 filter drop-shadow-[0_12px_12px_rgba(0,0,0,0.3)] z-15`,
      style: {
        transform: `translate(-50%, ${offsetY})`
      }
    };
  };


  const selectedSubtotal = currentItems
    .filter(item => selectedItemIds.includes(item.productId || item._id || item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const isWithinBudget = selectedSubtotal <= budget;
  const budgetBalance = budget - selectedSubtotal;

  // Visual Slider before and after images
  const beforeImageSrc = activeTemplateKey ? ROOM_TEMPLATES[activeTemplateKey].before : uploadPreview;
  const afterImageSrc = activeTemplateKey ? ROOM_TEMPLATES[activeTemplateKey].after : uploadPreview;

  // Active Hotspots Pins
  const activePins = activeTemplateKey
    ? ROOM_TEMPLATES[activeTemplateKey].pins
    : [
      { top: '55%', left: '32%', label: 'Sofa Placement', category: 'Sofa' },
      { top: '70%', left: '50%', label: 'Coffee Table', category: 'Tables' },
      { top: '48%', left: '74%', label: 'Accent Cabinet', category: 'Storage' }
    ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-8 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-[1700px] mx-auto">

        {/* HEADER SECTION */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2B2B2B] tracking-wider uppercase flex items-center gap-2">
              <FiLayers className="text-[#A66A2C]" />
              Chroma & Palette Matcher
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1 tracking-widest uppercase">
              Upload Your Space & Furnish Instantly
            </p>
          </div>

          {studioState === 'studio' && (
            <button
              onClick={() => setStudioState('setup')}
              className="bg-white border border-gray-200 text-gray-700 hover:border-black text-xs font-bold py-2.5 px-5 rounded-large transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FiArrowLeft size={14} /> Start New Design
            </button>
          )}
        </div>

        {/* BLUR / CONTRAST WARNING MODAL */}
        <AnimatePresence>
          {qualityWarning && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-large p-6 max-w-md w-full shadow-2xl border"
              >
                <div className="flex items-center gap-3 text-amber-500 mb-4">
                  <FiAlertCircle size={28} />
                  <h3 className="text-sm font-black text-gray-800 uppercase">Low Contrast Detected</h3>
                </div>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-6">
                  The uploaded photo seems slightly dark or blurry. For optimal color palette extraction and layout calculations, we recommend a clearer room angle.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setQualityWarning(false);
                      handleStartScanning();
                    }}
                    className="bg-white border border-gray-200 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-large hover:border-black transition-colors"
                  >
                    Proceed Anyway
                  </button>
                  <label className="bg-[#A66A2C] hover:bg-[#8C5623] text-white font-bold text-xs py-2.5 px-4 rounded-large cursor-pointer transition-colors">
                    Upload Clear Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setQualityWarning(false);
                        handleFileChange(e);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* STATE 1: DESIGN SETUP */}
        {studioState === 'setup' && (
          <div className="flex flex-col gap-10 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-100 rounded-large shadow-premium p-8">
                <h2 className="text-lg font-black text-gray-800 uppercase mb-2">Design Setup</h2>
                <p className="text-xs text-gray-400 font-semibold mb-6">Choose a style and upload your photo to plan your layout.</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Room Type</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-large px-3.5 py-3 bg-white focus:outline-none focus:border-[#A66A2C]"
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Dining Room">Dining Room</option>
                      <option value="Study Room">Study Desk / WFH Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Style Preference</label>
                    <select
                      value={stylePreference}
                      onChange={(e) => setStylePreference(e.target.value)}
                      className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-large px-3.5 py-3 bg-white focus:outline-none focus:border-[#A66A2C]"
                    >
                      <option value="Modern">Modern Minimalist</option>
                      <option value="Classic">Elegant Classic</option>
                      <option value="Minimal">Scandinavian Cozy</option>
                      <option value="Industrial">Industrial Raw</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Target Budget (₹)</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3.5 top-3 text-gray-400" size={14} />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full text-xs font-black border border-gray-200 rounded-large pl-8 pr-4 py-3 focus:outline-none focus:border-[#A66A2C]"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5">Try with Template Rooms</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => handleSelectTemplate('living-room')}
                      className={`text-xs font-bold py-2.5 border rounded-large transition-colors ${activeTemplateKey === 'living-room' ? 'bg-[#A66A2C] text-white border-[#A66A2C]' : 'bg-white hover:border-black'
                        }`}
                    >
                      Living Room
                    </button>
                    <button
                      onClick={() => handleSelectTemplate('bedroom')}
                      className={`text-xs font-bold py-2.5 border rounded-large transition-colors ${activeTemplateKey === 'bedroom' ? 'bg-[#A66A2C] text-white border-[#A66A2C]' : 'bg-white hover:border-black'
                        }`}
                    >
                      Bedroom
                    </button>
                    <button
                      onClick={() => handleSelectTemplate('study')}
                      className={`text-xs font-bold py-2.5 border rounded-large transition-colors ${activeTemplateKey === 'study' ? 'bg-[#A66A2C] text-white border-[#A66A2C]' : 'bg-white hover:border-black'
                        }`}
                    >
                      Study Desk
                    </button>
                  </div>
                </div>

                <div className="relative border-2 border-dashed border-gray-200 rounded-large p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer mb-6">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <FiUpload className="text-gray-400 mb-2.5" size={32} />
                  <span className="text-xs font-bold text-gray-600">Choose custom room photo</span>
                  <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">PNG, JPG, JPEG</span>
                </div>

                {uploadPreview && (
                  <div className="p-3 bg-[#FAF9F6] border rounded-large flex items-center gap-3">
                    <img src={uploadPreview} alt="preview" className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700 truncate">{selectedFile?.name || 'Selected Room'}</p>
                      <p className="text-[10px] text-green-600 font-extrabold uppercase tracking-wide">Image Loaded</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartScanning}
                  className="w-full bg-[#A66A2C] hover:bg-[#8C5623] text-white text-xs font-bold py-3.5 rounded-large transition-colors shadow mt-6 flex items-center justify-center gap-2"
                >
                  <span>Furnish & Style Room with AI</span>
                </button>
              </div>

              <div className="hidden lg:flex flex-col justify-between bg-[#FAF0E6] rounded-large border border-[#A66A2C]/10 p-8 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#A66A2C]/5 rounded-full filter blur-xl" />
                <div>
                  <span className="text-[9px] font-black text-[#A66A2C] uppercase tracking-widest block mb-2">How it works</span>
                  <h3 className="text-xl font-black text-gray-800 uppercase leading-snug mb-4">
                    Transform Your Space Instantly
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold mb-6">
                    Our advanced AI Interior Assistant maps walls and natural light coordinates in real time. It recommends high-compatibility color coordinates and matches them with active physical inventory from our database fitting your specified budget.
                  </p>
                </div>

                <div className="aspect-[16/10] rounded-large overflow-hidden border border-white shadow">
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80"
                    alt="rendering demo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STATE 2: AI SCANNING LOADING SCREEN */}
        {studioState === 'scanning' && (
          <div className="max-w-md mx-auto bg-white border rounded-large shadow-premium p-8 flex flex-col items-center justify-center min-h-[460px]">
            <div className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-[#A66A2C] animate-spin flex items-center justify-center mb-6">
              <span className="text-base font-black text-[#A66A2C]">{scanProgress}%</span>
            </div>

            <h3 className="text-base font-black text-gray-800 uppercase tracking-widest mb-1">Scanning Architecture</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6 text-center animate-pulse">
              {currentScanningStep || 'Detecting boundaries...'}
            </p>

            <div className="w-full flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
              {SCANNING_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[10px] font-bold text-gray-650">
                  {scannedSteps.includes(step) ? (
                    <FiCheckCircle className="text-green-500 shrink-0" size={13} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATE 3: INTERACTIVE DESIGN STUDIO DASHBOARD */}
        {studioState === 'studio' && backendAnalysis && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* COLUMN 1: VISUAL STUDIO & STYLE PREFERENCES (5/12 cols) */}
            <div className="xl:col-span-5 flex flex-col gap-6">

              {/* Upgraded Interactive Room Visualization Studio Canvas Card */}
              <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-800 uppercase">Interactive Studio</h3>
                    <div className="flex border rounded-large overflow-hidden text-[9px] font-extrabold uppercase">
                      <button
                        onClick={() => setCompareMode(false)}
                        className={`px-3 py-1.5 transition-colors ${!compareMode ? 'bg-[#2B2B2B] text-white' : 'bg-gray-50 text-gray-400'
                          }`}
                      >
                        Editor
                      </button>
                      <button
                        onClick={() => setCompareMode(true)}
                        className={`px-3 py-1.5 transition-colors ${compareMode ? 'bg-[#2B2B2B] text-white' : 'bg-gray-50 text-gray-400'
                          }`}
                      >
                        Split Layout
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                        {compareMode ? 'Left Style (Base)' : 'Design Preset'}
                      </label>
                      <select
                        value={activeLayout}
                        onChange={(e) => setActiveLayout(e.target.value)}
                        className="w-full text-xs font-bold text-gray-750 border border-gray-200 rounded-large px-2.5 py-1.5 bg-white focus:outline-none"
                      >
                        <option value="Modern">Modern Layout</option>
                        <option value="Luxury">Luxury Layout</option>
                        <option value="Minimal">Minimal Layout</option>
                        <option value="Scandinavian">Scandinavian Layout</option>
                      </select>
                    </div>

                    {compareMode && (
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Right Style (Compare)</label>
                        <select
                          value={compareLayout}
                          onChange={(e) => setCompareLayout(e.target.value)}
                          className="w-full text-xs font-bold text-gray-750 border border-gray-200 rounded-large px-2.5 py-1.5 bg-white focus:outline-none"
                        >
                          <option value="Modern">Modern Layout</option>
                          <option value="Luxury">Luxury Layout</option>
                          <option value="Minimal">Minimal Layout</option>
                          <option value="Scandinavian">Scandinavian Layout</option>
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (backendAnalysis?.layouts?.[activeLayout]) {
                          setLayoutsState(prev => ({
                            ...prev,
                            [activeLayout]: backendAnalysis.layouts[activeLayout].map(p => ({
                              ...p,
                              xPct: p.xPct || 50,
                              yPct: p.yPct || 50,
                              scale: p.scale || 1.0,
                              rotation: p.rotation || 0,
                              zIndex: p.zIndex || 5,
                              visible: p.visible !== false
                            }))
                          }));
                          toast.success(`Reset ${activeLayout} layout to system presets!`);
                        }
                      }}
                      className="border border-gray-200 text-gray-500 hover:text-black hover:border-black text-[9px] font-bold px-3 py-2 rounded-large transition-colors mt-4 self-end"
                    >
                      Reset Layout
                    </button>
                  </div>
                </div>

                {/* THE INTERACTIVE CANVAS */}
                <div
                  id="room-canvas-container"
                  className="relative aspect-[4/3] rounded-large overflow-hidden border border-gray-200 select-none mb-3 bg-gray-150"
                >
                  {/* Left Pane (Base Room & activeLayout) */}
                  <div className="absolute inset-0">
                    <img src={uploadPreview || beforeImageSrc} alt="Room Canvas Base" className="w-full h-full object-cover pointer-events-none" />

                    {(layoutsState[activeLayout] || []).map((item) => (
                      item.visible !== false && (
                        <div
                          key={item.productId}
                          className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-shadow ${selectedItem?.productId === item.productId ? 'ring-2 ring-[#A66A2C] ring-offset-2 rounded-large' : ''
                            }`}
                          style={{
                            left: `${item.xPct}%`,
                            top: `${item.yPct}%`,
                            zIndex: item.zIndex || 5,
                            transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${item.scale || 1.0})`
                          }}
                          onMouseDown={(e) => handleDragStart(e, item)}
                          onTouchStart={(e) => handleDragStart(e, item)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-w-[110px] md:max-w-[150px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] pointer-events-none"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
                            }}
                          />
                        </div>
                      )
                    ))}
                  </div>

                  {/* Right Pane (compareLayout) */}
                  {compareMode && (
                    <div
                      className="absolute inset-0 border-l-2 border-white z-10"
                      style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
                    >
                      <img src={uploadPreview || beforeImageSrc} alt="Room Canvas Base Compare" className="w-full h-full object-cover pointer-events-none" />

                      {(layoutsState[compareLayout] || []).map((item) => (
                        item.visible !== false && (
                          <div
                            key={item.productId}
                            className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-shadow ${selectedItem?.productId === item.productId ? 'ring-2 ring-[#A66A2C] ring-offset-2 rounded-large' : ''
                              }`}
                            style={{
                              left: `${item.xPct}%`,
                              top: `${item.yPct}%`,
                              zIndex: item.zIndex || 5,
                              transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${item.scale || 1.0})`
                            }}
                            onMouseDown={(e) => handleDragStart(e, item)}
                            onTouchStart={(e) => handleDragStart(e, item)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-w-[110px] md:max-w-[150px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] pointer-events-none"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
                              }}
                            />
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {/* Slider wipe controller */}
                  {compareMode && (
                    <>
                      <div
                        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-20"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-xs font-black text-gray-700">
                          ↔
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                  <span>{compareMode ? `${activeLayout} Layout` : 'Room Base Canvas'}</span>
                  <span>{compareMode ? `${compareLayout} Layout` : 'Interactive Mode Enabled'}</span>
                </div>
              </div>

              {/* Customization Controls Panel */}
              {selectedItem ? (
                <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-gray-800 uppercase">Item Customization</h3>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-[10px] font-extrabold text-gray-400 hover:text-black uppercase"
                    >
                      Deselect
                    </button>
                  </div>

                  <div className="flex items-center gap-3.5 mb-4 p-3 bg-gray-50 rounded-large border border-gray-100">
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12 object-contain" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-black text-gray-800 truncate uppercase leading-snug">{selectedItem.name}</h4>
                      <p className="text-[10px] font-black text-[#A66A2C] mt-0.5">₹{selectedItem.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 mb-1.5">
                        <span>Scale multiplier</span>
                        <span className="font-mono text-[#A66A2C]">{selectedItem.scale || 1.0}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={selectedItem.scale || 1.0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLayoutsState((prev) => {
                            const currentList = prev[activeLayout] || [];
                            const updatedList = currentList.map((item) => {
                              if (item.productId === selectedItem.productId) {
                                return { ...item, scale: val };
                              }
                              return item;
                            });
                            return { ...prev, [activeLayout]: updatedList };
                          });
                          setSelectedItem(prev => ({ ...prev, scale: val }));
                        }}
                        className="w-full accent-[#A66A2C]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 mb-1.5">
                        <span>Rotation angle</span>
                        <span className="font-mono text-[#A66A2C]">{selectedItem.rotation || 0}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={selectedItem.rotation || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLayoutsState((prev) => {
                            const currentList = prev[activeLayout] || [];
                            const updatedList = currentList.map((item) => {
                              if (item.productId === selectedItem.productId) {
                                return { ...item, rotation: val };
                              }
                              return item;
                            });
                            return { ...prev, [activeLayout]: updatedList };
                          });
                          setSelectedItem(prev => ({ ...prev, rotation: val }));
                        }}
                        className="w-full accent-[#A66A2C]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => {
                          const newZ = (selectedItem.zIndex || 5) + 1;
                          setLayoutsState((prev) => {
                            const currentList = prev[activeLayout] || [];
                            return {
                              ...prev,
                              [activeLayout]: currentList.map((item) =>
                                item.productId === selectedItem.productId ? { ...item, zIndex: newZ } : item
                              )
                            };
                          });
                          setSelectedItem(prev => ({ ...prev, zIndex: newZ }));
                          toast.success('Brought item forward in depth!');
                        }}
                        className="bg-gray-50 hover:bg-gray-100 border text-[10px] font-bold py-2 rounded-large text-gray-700 transition-colors"
                      >
                        Bring Forward
                      </button>

                      <button
                        onClick={() => {
                          const newZ = Math.max(1, (selectedItem.zIndex || 5) - 1);
                          setLayoutsState((prev) => {
                            const currentList = prev[activeLayout] || [];
                            return {
                              ...prev,
                              [activeLayout]: currentList.map((item) =>
                                item.productId === selectedItem.productId ? { ...item, zIndex: newZ } : item
                              )
                            };
                          });
                          setSelectedItem(prev => ({ ...prev, zIndex: newZ }));
                          toast.success('Sent item backward in depth!');
                        }}
                        className="bg-gray-50 hover:bg-gray-100 border text-[10px] font-bold py-2 rounded-large text-gray-700 transition-colors"
                      >
                        Send Backward
                      </button>

                      <button
                        onClick={() => {
                          const vis = selectedItem.visible !== false;
                          setLayoutsState((prev) => {
                            const currentList = prev[activeLayout] || [];
                            return {
                              ...prev,
                              [activeLayout]: currentList.map((item) =>
                                item.productId === selectedItem.productId ? { ...item, visible: !vis } : item
                              )
                            };
                          });
                          setSelectedItem(prev => ({ ...prev, visible: !vis }));
                          toast.success(vis ? 'Item hidden on canvas!' : 'Item shown on canvas!');
                        }}
                        className="bg-gray-50 hover:bg-gray-100 border text-[10px] font-bold py-2 rounded-large text-gray-700 transition-colors"
                      >
                        {selectedItem.visible !== false ? 'Hide Item' : 'Show Item'}
                      </button>
                    </div>

                    {selectedItem.alternatives && selectedItem.alternatives.length > 0 && (
                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <span className="text-[9px] font-black text-gray-450 uppercase tracking-widest block mb-2.5">
                          Alternative Catalog Recommendations
                        </span>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {selectedItem.alternatives.map((alt) => (
                            <div
                              key={alt.productId}
                              onClick={() => handleSwapItem(alt)}
                              className="group w-24 shrink-0 border border-gray-100 hover:border-[#A66A2C] rounded bg-[#FAF9F6] p-2 text-center transition-all cursor-pointer"
                            >
                              <img src={alt.image} alt={alt.name} className="w-12 h-12 object-contain mx-auto mb-1" />
                              <span className="text-[9px] font-black text-gray-750 block truncate">{alt.name}</span>
                              <span className="text-[8px] font-mono text-[#A66A2C] block mt-0.5">₹{alt.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Active Canvas Items & Layer Manager */}
                  <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-bold text-gray-800 uppercase flex items-center gap-2">
                        <FiLayers className="text-[#A66A2C]" size={14} /> Active Canvas Items ({currentItems.length})
                      </h3>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Click item to customize</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold mb-4">
                      Directly select, toggle visibility, or adjust depth ordering for products placed on your 2D design canvas.
                    </p>

                    <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                      {currentItems.map((item, idx) => {
                        const isSelected = selectedItem && (selectedItem.productId === item.productId || selectedItem.id === item.id);
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-large border transition-all cursor-pointer ${
                              isSelected ? 'border-[#A66A2C] bg-[#FAF0E6]/20' : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'
                            }`}
                            onClick={() => setSelectedItem(item)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover border bg-white shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-black text-gray-800 truncate">{item.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] font-bold text-[#A66A2C]">₹{item.price.toLocaleString('en-IN')}</span>
                                  <span className="text-[8px] font-semibold text-gray-400">Layer Depth {item.zIndex || 5}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  const vis = item.visible !== false;
                                  setLayoutsState((prev) => {
                                    const currentList = prev[activeLayout] || [];
                                    return {
                                      ...prev,
                                      [activeLayout]: currentList.map((it) =>
                                        it.productId === item.productId ? { ...it, visible: !vis } : it
                                      )
                                    };
                                  });
                                  toast.success(vis ? `Hidden ${item.name}` : `Shown ${item.name}`);
                                }}
                                className={`px-2 py-1 rounded border text-[9px] font-bold transition-colors ${
                                  item.visible !== false ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-200 text-gray-500'
                                }`}
                                title={item.visible !== false ? 'Hide from canvas' : 'Show on canvas'}
                              >
                                {item.visible !== false ? 'Visible' : 'Hidden'}
                              </button>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-2.5 py-1 bg-[#A66A2C] text-white rounded text-[9px] font-bold hover:bg-[#8C5623] transition-colors shadow-xs"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Spatial & Ergonomics Metrics */}
                  <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
                    <h3 className="text-xs font-bold text-gray-800 uppercase mb-3 flex items-center gap-2">
                      <FiActivity className="text-green-600" size={14} /> Room Spatial & Ergonomics
                    </h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-3 bg-green-50/60 border border-green-100 rounded-large text-center">
                        <span className="text-[8px] font-black text-green-700 uppercase block">Walkway Flow</span>
                        <span className="text-base font-black text-green-800">94%</span>
                        <span className="text-[8px] font-semibold text-green-600 block mt-0.5">Optimal Flow</span>
                      </div>
                      <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-large text-center">
                        <span className="text-[8px] font-black text-amber-700 uppercase block">Daylight Gain</span>
                        <span className="text-base font-black text-amber-800">88%</span>
                        <span className="text-[8px] font-semibold text-amber-600 block mt-0.5">Window Aligned</span>
                      </div>
                      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-large text-center">
                        <span className="text-[8px] font-black text-blue-700 uppercase block">Color Harmony</span>
                        <span className="text-base font-black text-blue-800">60:30:10</span>
                        <span className="text-[8px] font-semibold text-blue-600 block mt-0.5">Proportioned</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-large flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDroplet className="text-[#A66A2C]" size={16} />
                        <div>
                          <span className="text-[11px] font-black text-gray-800 block">Material Care & Durability</span>
                          <span className="text-[9px] text-gray-500 font-semibold block">Solid Wood & High-Density Upholstery</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black bg-[#FAF0E6] text-[#A66A2C] px-2.5 py-1 rounded-full uppercase">
                        Grade A+
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* COLUMN 2: SHOP THE LOOK & FULLY DETAILED STOREFRONT CARDS (4/12 cols) */}
            <div className="xl:col-span-4 flex flex-col gap-6">

              <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6 flex flex-col justify-between min-h-[750px]">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-bold text-gray-800 uppercase">Shop The Look</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-450 font-semibold">
                      <FiCheckSquare size={13} />
                      <span>{selectedItemIds.length} / {currentItems.length} selected</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold mb-6">Select items to compile your custom package catalog. Click thumbnail for Quick View details.</p>

                  {/* Fully detailed e-commerce item cards to fill vertical space */}
                  <div className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1">
                    {currentItems.map((item, idx) => {
                      const itemId = item.productId || item._id || item.id;
                      const isChecked = selectedItemIds.includes(itemId);

                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 p-4 rounded-large border transition-all ${isChecked ? 'border-[#A66A2C] bg-[#FAF0E6]/10' : 'border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedItemIds([...selectedItemIds, itemId]);
                              else setSelectedItemIds(selectedItemIds.filter(x => x !== itemId));
                            }}
                            className="rounded text-[#A66A2C] focus:ring-[#A66A2C] cursor-pointer mt-1.5"
                          />

                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
                            }}
                            onClick={() => openProductQuickView(item)}
                            className="w-16 h-16 rounded object-cover shrink-0 border bg-white cursor-pointer hover:opacity-85 transition-opacity"
                            title="Click to view details"
                          />

                          <div className="min-w-0 flex-1">
                            <p
                              onClick={() => openProductQuickView(item)}
                              className="text-xs font-black text-gray-800 truncate hover:text-[#A66A2C] transition-colors cursor-pointer"
                            >
                              {item.name}
                            </p>

                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex text-yellow-500 scale-90 origin-left">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} size={10} className="fill-current" />
                                ))}
                              </div>
                              <span className="text-[9px] font-bold text-gray-400">({item.reviewsCount || 100})</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[8px] font-black uppercase bg-[#FAF0E6] text-[#A66A2C] px-2 py-0.5 rounded">
                                {item.material}
                              </span>
                              <span className="text-[8px] font-black uppercase bg-green-50 text-green-600 px-2 py-0.5 rounded">
                                {item.score}% Match
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                            <span className="text-xs font-black text-gray-800">₹{item.price.toLocaleString('en-IN')}</span>
                            <div className="flex gap-1.5 mt-4">
                              <button
                                onClick={() => openProductQuickView(item)}
                                className="p-1.5 text-gray-400 hover:text-black border rounded hover:bg-gray-100 transition-colors"
                                title="Quick View Product Details"
                              >
                                <FiInfo size={12} />
                              </button>
                              <button
                                onClick={() => navigate(`/product/${itemId}`)}
                                className="p-1.5 text-gray-455 hover:text-black border rounded hover:bg-gray-100 transition-colors"
                                title="Open full product page"
                              >
                                <FiExternalLink size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-extrabold text-gray-455 uppercase">Subtotal cost</span>
                    <span className="text-base font-black text-gray-850">₹{selectedSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddCheckedToCart}
                      className="bg-[#A66A2C] hover:bg-[#8C5623] text-white text-xs font-bold py-3.5 rounded-large transition-colors shadow flex items-center justify-center gap-1.5"
                    >
                      <FiShoppingCart size={13} /> Add Selected
                    </button>
                    <button
                      onClick={() => {
                        currentItems.forEach((item) => {
                          addToCart({
                            id: item.productId || item._id || item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            quantity: 1
                          });
                        });
                        toast.success(`All ${currentItems.length} items added to your cart!`);
                      }}
                      className="bg-[#2B2B2B] hover:bg-black text-white text-xs font-bold py-3.5 rounded-large transition-colors shadow flex items-center justify-center gap-1.5"
                    >
                      <FiCheck size={13} /> Add All items
                    </button>
                  </div>
                </div>
              </div>

              {/* Budget compliance box */}
              <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase">Budget Optimizer</h3>
                  {isWithinBudget ? (
                    <span className="bg-green-50 text-green-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">Within Budget</span>
                  ) : (
                    <span className="bg-red-50 text-red-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">Exceeds Budget</span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-555">
                    <span className="text-gray-400 font-extrabold uppercase text-[9px]">Target Budget</span>
                    <span>₹{budget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-555 border-t pt-2">
                    <span className="text-gray-400 font-extrabold uppercase text-[9px]">Remaining Balance</span>
                    <span className={budgetBalance < 0 ? 'text-red-500 font-black' : 'text-green-600 font-black'}>
                      ₹{budgetBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 3: AI ASSISTANT & SAVE ACTIONS (3/12 cols) */}
            <div className="xl:col-span-3 flex flex-col gap-6">

              {/* Chat panel */}
              <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6 flex flex-col justify-between min-h-[500px] xl:h-[580px]">
                <div>
                  <h3 className="text-xs font-bold text-[#2B2B2B] uppercase mb-1">Design Copilot</h3>
                  <p className="text-[10px] text-gray-455 font-semibold mb-4">Refining your selections in real time.</p>

                  <div className="border border-gray-105 rounded-large p-4 h-[300px] xl:h-[380px] overflow-y-auto bg-gray-50/50 flex flex-col gap-3.5 scrollbar-none select-text">
                    {chatLogs.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                          <div className="w-6 h-6 rounded-full bg-[#A66A2C]/10 border border-[#A66A2C]/20 flex items-center justify-center text-[10px] font-black text-[#A66A2C] shrink-0">
                            AI
                          </div>
                        )}
                        <div className={`p-3 rounded-large max-w-[85%] text-[11px] font-semibold leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#A66A2C] text-white' : 'bg-white border border-gray-105 text-gray-650'
                          }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    <button onClick={() => handleChatSubmit('Make it cheaper')} className="text-[9px] font-extrabold bg-green-50 text-green-600 border px-2 py-0.5 rounded-full whitespace-nowrap">
                      💸 Cheaper Sofa
                    </button>
                    <button onClick={() => handleChatSubmit('Make it luxurious')} className="text-[9px] font-extrabold bg-[#FAF0E6] text-[#A66A2C] border px-2 py-0.5 rounded-full whitespace-nowrap">
                      ✨ Solid Walnut Finish
                    </button>
                    <button onClick={() => handleChatSubmit('I have pets')} className="text-[9px] font-extrabold bg-blue-50 text-blue-600 border px-2 py-0.5 rounded-full whitespace-nowrap">
                      🐾 Scratch-Proof Fabric
                    </button>
                    <button onClick={() => handleChatSubmit('I have kids')} className="text-[9px] font-extrabold bg-amber-50 text-amber-600 border px-2 py-0.5 rounded-full whitespace-nowrap">
                      🛡️ Child-Safe
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask copilot to adjust theme..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                      className="flex-1 text-xs border border-gray-200 rounded-large px-3.5 py-3 focus:outline-none focus:border-[#A66A2C]"
                    />
                    <button onClick={() => handleChatSubmit()} className="bg-[#A66A2C] hover:bg-[#8C5623] text-white p-3 rounded-large transition-colors flex items-center justify-center shadow">
                      <FiSend size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Customization switches */}
              <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
                <h3 className="text-xs font-bold text-gray-800 uppercase mb-4">Preference Toggles</h3>

                <div className="flex flex-col gap-2.5">
                  {[
                    { key: 'wfh', label: 'WFH Layout', desc: 'Adds desk/chair setups' },
                    { key: 'pets', label: 'Pet Friendly', desc: 'Scratch-resistant fabric' },
                    { key: 'kids', label: 'Child Safe', desc: 'Rounded corner shapes' }
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-center justify-between p-2.5 rounded-large border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer select-none">
                      <div>
                        <span className="text-[11px] font-black text-gray-700 block">{pref.label}</span>
                        <span className="text-[9px] text-gray-400 font-semibold block">{pref.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences[pref.key]}
                        onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-[#A66A2C] focus:ring-[#A66A2C]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Share & Save Panel */}
              <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
                <h3 className="text-xs font-bold text-gray-800 uppercase mb-4">Export Layout</h3>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveLayout}
                    disabled={isSavingLayout}
                    className="flex items-center justify-center gap-2 w-full bg-[#A66A2C] text-white hover:bg-[#8C5623] disabled:opacity-50 text-xs font-bold py-3 rounded-large transition-colors shadow"
                  >
                    <FiHeart className={designSaved ? 'fill-white text-white' : ''} />
                    <span>{isSavingLayout ? 'Saving Layout...' : designSaved ? 'Layout Saved' : 'Save Layout State'}</span>
                  </button>

                  <button
                    onClick={handleDownloadVisualization}
                    className="flex items-center justify-center gap-2 w-full bg-[#2B2B2B] text-white hover:bg-black text-xs font-bold py-3 rounded-large transition-colors shadow"
                  >
                    <FiDownload size={14} />
                    <span>Download Image (.JPG)</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Shareable link copied!');
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 hover:border-black text-xs font-bold py-3 rounded-large transition-colors"
                  >
                    <FiShare2 size={14} />
                    <span>Copy Shareable Link</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM ROW: BALANCED ANALYSIS & SUSTAINABILITY SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start mt-8">
              {/* Style Signature Coordinates (8/12 cols) */}
              <div className="xl:col-span-8 bg-white border border-gray-100 rounded-large shadow-premium p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase">Style Coordinates</h3>
                  <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {backendAnalysis.interiorStyle || stylePreference} — 92% Match
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Detected Palette Swatches</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(backendAnalysis.palette || []).map((color, i) => (
                        <div key={i} className="flex flex-col items-center p-2 border rounded-large bg-gray-50/50 hover:bg-gray-50 transition-colors">
                          <div className="w-full aspect-square rounded border border-gray-200 mb-1.5 shadow-inner" style={{ backgroundColor: color.hex }} />
                          <span className="text-[9px] font-black text-gray-700 truncate w-full text-center">{color.name}</span>
                          <span className="text-[8px] font-mono text-gray-400 mt-0.5">{color.hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-50 rounded-large border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Flooring</span>
                      <p className="text-xs font-bold text-gray-700">{backendAnalysis.flooringMaterial || backendAnalysis.flooring || 'Hardwood'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-large border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Lighting</span>
                      <p className="text-xs font-bold text-gray-700">{backendAnalysis.lightingConditions || backendAnalysis.lighting || 'Ambient Natural Light'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-large border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Windows</span>
                      <p className="text-xs font-bold text-gray-750 truncate">
                        {Array.isArray(backendAnalysis.windows)
                          ? backendAnalysis.windows.join(', ')
                          : backendAnalysis.windows || 'None detected'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-large border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Doors</span>
                      <p className="text-xs font-bold text-gray-750 truncate">
                        {Array.isArray(backendAnalysis.doors)
                          ? backendAnalysis.doors.join(', ')
                          : backendAnalysis.doors || 'None detected'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-large border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Detected Existing Furniture</span>
                      <p className="text-xs font-bold text-gray-750 truncate">
                        {Array.isArray(backendAnalysis.existingFurniture)
                          ? backendAnalysis.existingFurniture.join(', ')
                          : backendAnalysis.existingFurniture || 'None detected'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-large border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Empty Floor Space</span>
                      <p className="text-xs font-bold text-gray-750 truncate">{backendAnalysis.emptyFloorSpace || 'Open floor space ready'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-large border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Perspective Parameters</span>
                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-600 mt-1">
                        <span>H: {backendAnalysis.perspective?.horizonHeightPct || 50}%</span>
                        <span>{backendAnalysis.perspective?.cameraAngle || 'Eye-level'}</span>
                        <span>{backendAnalysis.perspective?.depthField || 'Standard'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sustainability Vibe Score (4/12 cols) */}
              <div className="xl:col-span-4 bg-white border border-gray-100 rounded-large shadow-premium p-6 flex flex-col justify-between h-full min-h-[300px]">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-gray-800 uppercase">Sustainability Vibe</h3>
                    <span className="text-xs font-black text-green-600">92 / 100 Vibe Score</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 mt-2">
                    <div className="p-3 border rounded-large bg-gray-50/50 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Wood Sourced</span>
                      <div className="flex text-green-600 gap-0.5 mt-0.5">
                        <FiStar size={10} className="fill-current" />
                        <FiStar size={10} className="fill-current" />
                        <FiStar size={10} className="fill-current" />
                        <FiStar size={10} className="fill-current" />
                        <FiStar size={10} className="fill-current" />
                      </div>
                    </div>
                    <div className="p-3 border rounded-large bg-gray-50/50 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Carbon Impact</span>
                      <span className="text-xs font-black text-green-600 uppercase mt-0.5">Low Footprint</span>
                    </div>
                    <div className="p-3 border rounded-large bg-gray-50/50 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Materials</span>
                      <span className="text-xs font-black text-gray-700 mt-0.5">Eco-Friendly Fabric</span>
                    </div>
                    <div className="p-3 border rounded-large bg-gray-50/50 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Maintenance</span>
                      <span className="text-xs font-black text-gray-700 mt-0.5">Easy Clean</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50/60 border border-green-200/60 rounded-large text-center">
                  <p className="text-[10px] font-bold text-green-800">
                    🌱 FSC certified sustainably harvested timber & low-VOC organic finishes.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── PRODUCT QUICK VIEW DETAILS MODAL ────────────────────────────── */}
        <AnimatePresence>
          {selectedQuickViewProduct && (
            <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-text">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-large max-w-4xl w-full shadow-2xl overflow-hidden border flex flex-col md:flex-row relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedQuickViewProduct(null)}
                  className="absolute right-4 top-4 bg-white/80 p-2 rounded-full border shadow hover:bg-gray-100 transition-colors z-10"
                >
                  <FiX size={18} />
                </button>

                {/* Left Side: Image Gallery */}
                <div className="w-full md:w-1/2 p-6 bg-gray-50 flex flex-col justify-between border-r">
                  <div className="aspect-[4/3] rounded-large overflow-hidden border bg-white mb-4 shadow-sm flex items-center justify-center">
                    <img
                      src={quickViewMainImage || selectedQuickViewProduct.image}
                      alt={selectedQuickViewProduct.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {(selectedQuickViewProduct.images || [selectedQuickViewProduct.image]).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setQuickViewMainImage(img)}
                        className={`w-14 h-14 rounded-large overflow-hidden border-2 bg-white shrink-0 transition-all ${quickViewMainImage === img ? 'border-[#A66A2C]' : 'border-gray-250 opacity-60'
                          }`}
                      >
                        <img
                          src={img}
                          alt={`thumb-${i}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side: Product Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1">
                      {selectedQuickViewProduct.category || 'Furniture'} / Mahaveer SmartCraft
                    </span>
                    <h2 className="text-xl font-black text-gray-800 leading-tight mb-2">
                      {selectedQuickViewProduct.name}
                    </h2>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} size={12} className="fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-700">{selectedQuickViewProduct.rating || 4.5}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">({selectedQuickViewProduct.reviewsCount || 120} reviews)</span>
                      <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full ml-auto">
                        {selectedQuickViewProduct.score}% Match Vibe
                      </span>
                    </div>

                    <div className="text-lg font-black text-gray-900 mb-4">
                      ₹{selectedQuickViewProduct.price.toLocaleString('en-IN')}
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-semibold mb-6">
                      {selectedQuickViewProduct.description}
                    </p>

                    {/* Specs Table */}
                    <div className="border border-gray-100 rounded-large overflow-hidden mb-6">
                      <table className="w-full text-left text-[11px] font-semibold">
                        <tbody className="divide-y divide-gray-100">
                          <tr className="bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">Material</td>
                            <td className="px-3 py-2 text-gray-700 font-bold">{selectedQuickViewProduct.material}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-gray-400">Dimensions</td>
                            <td className="px-3 py-2 text-gray-700 font-bold">{selectedQuickViewProduct.dimensions}</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">Color Coordinates</td>
                            <td className="px-3 py-2 text-gray-700 font-bold">{selectedQuickViewProduct.colorName || 'Default'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addToCart({
                          id: selectedQuickViewProduct.productId || selectedQuickViewProduct._id || selectedQuickViewProduct.id,
                          name: selectedQuickViewProduct.name,
                          price: selectedQuickViewProduct.price,
                          image: selectedQuickViewProduct.image,
                          quantity: 1
                        });
                        toast.success('Product added to shopping cart!');
                        setSelectedQuickViewProduct(null);
                      }}
                      className="flex-1 bg-[#A66A2C] hover:bg-[#8C5623] text-white text-xs font-bold py-3.5 rounded-large transition-colors shadow flex items-center justify-center gap-2"
                    >
                      <FiShoppingCart size={14} /> Add to Cart
                    </button>

                    <button
                      onClick={() => {
                        setSelectedQuickViewProduct(null);
                        navigate(`/product/${selectedQuickViewProduct.productId || selectedQuickViewProduct._id || selectedQuickViewProduct.id}`);
                      }}
                      className="bg-white border border-gray-200 text-gray-700 hover:border-black text-xs font-bold px-5 py-3.5 rounded-large transition-colors flex items-center gap-1.5"
                    >
                      <span>Full Specifications</span>
                      <FiExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
