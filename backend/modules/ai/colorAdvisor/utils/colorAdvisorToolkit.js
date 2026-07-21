const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeText = (value = '') => String(value).trim();

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(typeof item === 'object' ? item.name || item.label || item.value : item))
      .filter(Boolean);
  }
  return [normalizeText(value)].filter(Boolean);
};

const parseBudget = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (!text) return { key: 'value', min: 20000, max: 50000 };
  if (text.includes('budget') || text.includes('low')) return { key: 'budget', min: 0, max: 25000 };
  if (text.includes('premium') || text.includes('high') || text.includes('luxury')) return { key: 'premium', min: 50000, max: 2000000 };
  return { key: 'value', min: 20000, max: 50000 };
};

const THEME_TO_STYLE = {
  Modern: 'Modern',
  Classic: 'Classic',
  Minimal: 'Minimal',
  Industrial: 'Industrial'
};

const ROOM_CATEGORY_PRIORITY = {
  'Living Room': ['Sofa', 'Chair', 'Tables', 'Storage'],
  'Bedroom': ['Bed', 'Storage', 'Tables', 'Chair'],
  'Dining Room': ['Dining', 'Chair', 'Tables', 'Storage'],
  'Hall': ['Sofa', 'Chair', 'Tables', 'Storage'],
  'Office': ['Tables', 'Chair', 'Storage'],
  'Study Room': ['Tables', 'Chair', 'Storage'],
  'Kitchen': ['Storage', 'Tables', 'Chair'],
  'Unknown': ['Sofa', 'Chair', 'Tables', 'Storage']
};

const ROOM_ALLOWED_CATEGORIES = {
  'Living Room': ['Sofa', 'Chair', 'Tables', 'Storage'],
  'Bedroom': ['Bed', 'Storage', 'Tables', 'Chair'],
  'Dining Room': ['Dining', 'Chair', 'Tables', 'Storage'],
  'Hall': ['Sofa', 'Chair', 'Tables', 'Storage'],
  'Office': ['Tables', 'Chair', 'Storage'],
  'Study Room': ['Tables', 'Chair', 'Storage'],
  'Kitchen': ['Storage', 'Tables', 'Chair'],
  'Unknown': ['Sofa', 'Chair', 'Tables', 'Storage']
};

const COLOR_LIBRARY = {
  Beige: '#E8D8C2',
  Taupe: '#B38B6D',
  Brown: '#8B5E3C',
  Charcoal: '#3B3B3B',
  Gray: '#708090',
  Grey: '#708090',
  White: '#F5F5F5',
  Cream: '#FFFDD0',
  Teal: '#008080',
  Copper: '#B87333',
  Gold: '#C5B358',
  Green: '#228B22',
  Blue: '#4D7EA8',
  Black: '#1C1C1C'
};

const toPaletteItems = (colors = []) => {
  return normalizeList(colors).slice(0, 5).map((name, index) => ({
    name,
    hex: COLOR_LIBRARY[name] || '#D9D9D9',
    role: index === 0 ? 'primary' : index === 1 ? 'secondary' : 'accent'
  }));
};

const defaultDecorRecommendations = {
  upholsteryMaterials: ['Linen', 'Textured Cotton', 'Performance Fabric'],
  curtainColors: ['Warm Cream', 'Muted Taupe'],
  rugs: ['Neutral handwoven rug', 'Low-pile geometric rug'],
  wallDecor: ['Framed abstract art', 'Wooden panel mirror'],
  indoorPlants: ['Areca Palm', 'Snake Plant'],
  lighting: ['Warm LED floor lamp', 'Layered pendant lights']
};

module.exports = {
  clamp,
  normalizeText,
  normalizeList,
  parseBudget,
  THEME_TO_STYLE,
  ROOM_CATEGORY_PRIORITY,
  ROOM_ALLOWED_CATEGORIES,
  COLOR_LIBRARY,
  toPaletteItems,
  defaultDecorRecommendations
};
