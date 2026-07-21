const ROOM_TYPE_CATEGORIES = {
  'Living Room': ['Sofa', 'Tables', 'Chair', 'Storage'],
  'Bedroom': ['Bed', 'Storage', 'Chair', 'Tables'],
  'Dining Room': ['Dining', 'Chair', 'Tables', 'Storage'],
  'Office': ['Chair', 'Tables', 'Storage'],
  'Kitchen': ['Storage', 'Tables', 'Chair'],
  'Hall': ['Sofa', 'Tables', 'Chair', 'Storage'],
  'Unknown': ['Sofa', 'Tables', 'Storage']
};

const STYLE_ALIASES = {
  modern: 'Modern',
  luxury: 'Luxury',
  minimal: 'Minimal',
  minimalist: 'Minimal',
  classic: 'Classic',
  industrial: 'Industrial',
  scandinavian: 'Scandinavian'
};

const STYLE_KEYWORDS = {
  Modern: ['clean', 'sleek', 'linear', 'neutral', 'contemporary'],
  Luxury: ['velvet', 'premium', 'rich', 'elegant', 'polished'],
  Minimal: ['minimal', 'simple', 'open', 'airy', 'clutter-free'],
  Classic: ['carved', 'ornate', 'traditional', 'timeless', 'formal'],
  Industrial: ['metal', 'steel', 'raw', 'exposed', 'utility'],
  Scandinavian: ['light wood', 'cozy', 'soft', 'functional', 'bright']
};

const COLOR_LIBRARY = {
  white: { hex: '#F8F8F8', role: 'base' },
  ivory: { hex: '#FFF8E7', role: 'base' },
  beige: { hex: '#E8D8C2', role: 'neutral' },
  cream: { hex: '#F6E7C1', role: 'neutral' },
  brown: { hex: '#8B5E3C', role: 'earth' },
  oak: { hex: '#C29B6B', role: 'wood' },
  wood: { hex: '#A97443', role: 'wood' },
  grey: { hex: '#8A8A8A', role: 'neutral' },
  gray: { hex: '#8A8A8A', role: 'neutral' },
  charcoal: { hex: '#3B3B3B', role: 'contrast' },
  black: { hex: '#111111', role: 'contrast' },
  blue: { hex: '#4D7EA8', role: 'accent' },
  green: { hex: '#6B8E23', role: 'accent' },
  amber: { hex: '#C78B31', role: 'accent' },
  gold: { hex: '#C5A13D', role: 'accent' },
  red: { hex: '#A24A3A', role: 'accent' },
  fabric: { hex: '#D9D1C3', role: 'texture' },
  leather: { hex: '#7A4C2E', role: 'texture' },
  velvet: { hex: '#7A3E66', role: 'texture' },
  steel: { hex: '#7B8794', role: 'material' }
};

const BUDGET_BANDS = {
  budget: { label: 'Budget', min: 0, max: 20000 },
  value: { label: 'Value', min: 20000, max: 50000 },
  premium: { label: 'Premium', min: 50000, max: 1000000000 }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeText = (value = '') => String(value).trim();

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(normalizeText);
  return [normalizeText(value)];
};

const safeJsonParse = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    try {
      return JSON.parse(match[0]);
    } catch (innerError) {
      return fallback;
    }
  }
};

const inferRoomTypeFromText = (input = '') => {
  const text = normalizeText(input).toLowerCase();
  if (text.includes('bed')) return 'Bedroom';
  if (text.includes('dining') || text.includes('eat') || text.includes('kitchen')) return 'Dining Room';
  if (text.includes('office') || text.includes('study') || text.includes('work')) return 'Office';
  if (text.includes('storage') || text.includes('cabinet') || text.includes('closet')) return 'Storage';
  if (text.includes('hall')) return 'Hall';
  return 'Living Room';
};

const normalizeRoomType = (input, fallback = 'Living Room') => {
  const text = normalizeText(input);
  if (!text) return fallback;
  const candidate = text.toLowerCase();
  if (candidate.includes('bed')) return 'Bedroom';
  if (candidate.includes('dining')) return 'Dining Room';
  if (candidate.includes('office')) return 'Office';
  if (candidate.includes('kitchen')) return 'Kitchen';
  if (candidate.includes('hall')) return 'Hall';
  if (candidate.includes('living')) return 'Living Room';
  if (candidate.includes('storage')) return 'Storage';
  return fallback;
};

const normalizeStyle = (input, fallback = 'Modern') => {
  const text = normalizeText(input).toLowerCase();
  for (const [key, value] of Object.entries(STYLE_ALIASES)) {
    if (text.includes(key)) return value;
  }
  return fallback;
};

const colorNameToHex = (input) => {
  if (!input) return null;
  const text = normalizeText(input).toLowerCase();
  if (text.startsWith('#')) return text;
  for (const [key, value] of Object.entries(COLOR_LIBRARY)) {
    if (text.includes(key)) return value.hex;
  }
  return null;
};

const normalizeColorPalette = (palette = []) => {
  const items = Array.isArray(palette) ? palette : normalizeList(palette);
  return items.map((item, index) => {
    const isObject = item && typeof item === 'object';
    const name = normalizeText(isObject ? item.name || item.label || item.color || item.value : item);
    const hex = (isObject && normalizeText(item.hex)) || colorNameToHex(name) || '#D9D9D9';
    const role = (isObject && normalizeText(item.role)) || COLOR_LIBRARY[name.toLowerCase()]?.role || (index === 0 ? 'base' : 'accent');
    return {
      name,
      hex,
      role
    };
  });
};

const normalizeMaterials = (materials = []) => {
  const items = Array.isArray(materials) ? materials : normalizeList(materials);
  return items.map((item, index) => ({
    name: normalizeText(item && typeof item === 'object' ? item.name || item.label || item.value : item),
    confidence: clamp(90 - index * 8, 35, 96)
  }));
};

const parseBudgetPreference = (budget) => {
  if (typeof budget === 'number' && Number.isFinite(budget)) {
    if (budget <= BUDGET_BANDS.budget.max) return { ...BUDGET_BANDS.budget, target: budget };
    if (budget <= BUDGET_BANDS.value.max) return { ...BUDGET_BANDS.value, target: budget };
    return { ...BUDGET_BANDS.premium, target: budget };
  }

  const text = normalizeText(budget).toLowerCase();
  if (text.includes('budget') || text.includes('low')) return { ...BUDGET_BANDS.budget, target: BUDGET_BANDS.budget.max };
  if (text.includes('premium') || text.includes('high')) return { ...BUDGET_BANDS.premium, target: BUDGET_BANDS.premium.min };
  if (text.includes('value') || text.includes('mid')) return { ...BUDGET_BANDS.value, target: BUDGET_BANDS.value.max };
  return null;
};

const roomTypeToCategories = (roomType) => ROOM_TYPE_CATEGORIES[roomType] || ROOM_TYPE_CATEGORIES['Unknown'];

const styleKeywords = (style) => STYLE_KEYWORDS[style] || STYLE_KEYWORDS.Modern;

const extractNumericDimensions = (text = '') => {
  const source = normalizeText(text).toLowerCase();
  const numbers = source.match(/(\d+(?:\.\d+)?)/g) || [];
  const parsed = numbers.slice(0, 3).map(Number);
  return {
    width: parsed[0] || null,
    length: parsed[1] || null,
    height: parsed[2] || null
  };
};

const estimateRoomSize = ({ roomSize, freeSpace }) => {
  const normalized = normalizeText(roomSize).toLowerCase();
  if (normalized.includes('compact')) return 'Compact';
  if (normalized.includes('spacious') || normalized.includes('large')) return 'Spacious';
  if (normalized.includes('tiny') || normalized.includes('small')) return 'Compact';
  if (normalized.includes('medium') || normalized.includes('standard')) return 'Standard';

  const freeSpaceScore = Number(freeSpace?.percentage ?? freeSpace?.level ?? 0);
  if (freeSpaceScore >= 60) return 'Spacious';
  if (freeSpaceScore <= 35) return 'Compact';
  return 'Standard';
};

const parseProductSize = (dimensions = '') => {
  const numbers = String(dimensions).match(/(\d+(?:\.\d+)?)/g) || [];
  return numbers.slice(0, 3).map(Number);
};

const buildFallbackAnalysis = ({ file, roomTypeHint, budgetPreference, stylePreference }) => {
  const roomType = normalizeRoomType(roomTypeHint || inferRoomTypeFromText(file?.originalname), 'Living Room');
  const style = normalizeStyle(stylePreference || '', roomType === 'Bedroom' ? 'Minimal' : 'Modern');
  const paletteMap = {
    'Living Room': ['Beige', 'Brown', 'Charcoal'],
    'Bedroom': ['Ivory', 'Grey', 'Oak'],
    'Dining Room': ['Brown', 'Amber', 'Black'],
    'Office': ['Charcoal', 'Grey', 'Oak'],
    'Kitchen': ['White', 'Steel', 'Grey'],
    'Hall': ['Beige', 'White', 'Oak']
  };

  return {
    roomType,
    roomSize: roomType === 'Bedroom' ? 'Standard' : 'Spacious',
    style,
    styleConfidence: 68,
    colors: paletteMap[roomType] || ['Beige', 'Brown', 'Grey'],
    colorPalette: normalizeColorPalette(paletteMap[roomType] || ['Beige', 'Brown', 'Grey']).map((item, index) => ({
      ...item,
      role: index === 0 ? 'base' : 'accent'
    })),
    materials: roomType === 'Bedroom' ? ['Wood', 'Fabric'] : ['Wood', 'Fabric', 'Metal'],
    materialsDetected: normalizeMaterials(roomType === 'Bedroom' ? ['Wood', 'Fabric'] : ['Wood', 'Fabric', 'Metal']),
    wallColors: paletteMap[roomType] || ['Beige'],
    flooring: roomType === 'Office' ? 'Wood' : 'Tile',
    windows: { count: 1, placement: 'left wall', lightLevel: 'natural' },
    doors: { count: 1, placement: 'right side' },
    lighting: { type: ['natural', 'ambient'], brightness: 'medium' },
    furniturePresent: roomType === 'Bedroom' ? ['Bed', 'Wardrobe'] : ['Seating', 'Table'],
    freeSpace: { level: roomType === 'Bedroom' ? 'medium' : 'high', percentage: roomType === 'Bedroom' ? 44 : 58, notes: 'Fallback heuristic analysis' },
    dimensionsEstimate: { widthFeet: 12, lengthFeet: 14, ceilingHeightFeet: 9 },
    spatialObservations: ['Fallback analysis generated because vision model was unavailable.'],
    roomIssues: ['Image quality or model availability limited direct vision parsing.'],
    recommendedCategories: roomTypeToCategories(roomType),
    furnitureNeedSummary: roomTypeToCategories(roomType).map((item) => `Add a ${item.toLowerCase()} to strengthen the room.`),
    budgetPreference: parseBudgetPreference(budgetPreference),
    roomTypeConfidence: 66,
    colorConfidence: 64,
    materialConfidence: 62,
    spatialConfidence: 65,
    visionConfidence: 60
  };
};

module.exports = {
  ROOM_TYPE_CATEGORIES,
  STYLE_KEYWORDS,
  COLOR_LIBRARY,
  BUDGET_BANDS,
  clamp,
  normalizeText,
  normalizeList,
  safeJsonParse,
  inferRoomTypeFromText,
  normalizeRoomType,
  normalizeStyle,
  normalizeColorPalette,
  normalizeMaterials,
  parseBudgetPreference,
  roomTypeToCategories,
  styleKeywords,
  extractNumericDimensions,
  estimateRoomSize,
  parseProductSize,
  buildFallbackAnalysis
};