const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  normalizeList,
  toPaletteItems,
  THEME_TO_STYLE,
  defaultDecorRecommendations,
  clamp
} = require('../utils/colorAdvisorToolkit');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'MOCK_KEY');

const fallbackFromTheme = (theme, roomType = 'Living Room') => {
  const style = THEME_TO_STYLE[theme] || 'Modern';
  const byTheme = {
    Modern: {
      wall: ['Warm Taupe'],
      accents: ['Teal', 'Cream', 'Gray', 'Copper'],
      flooring: 'Natural Oak',
      mood: 'Calm Contemporary',
      lighting: 'Balanced warm daylight',
      textures: ['Matte wood', 'Soft fabric', 'Brushed metal']
    },
    Classic: {
      wall: ['Royal Beige'],
      accents: ['Gold', 'Forest Green', 'Cream', 'Brown'],
      flooring: 'Walnut Wood',
      mood: 'Elegant and Formal',
      lighting: 'Warm layered lighting',
      textures: ['Polished wood', 'Velvet', 'Brass accents']
    },
    Minimal: {
      wall: ['Pebble White'],
      accents: ['Gray', 'Cream', 'Oak'],
      flooring: 'Ash Wood',
      mood: 'Quiet and Airy',
      lighting: 'Soft natural light',
      textures: ['Smooth fabric', 'Raw wood', 'Matte ceramic']
    },
    Industrial: {
      wall: ['Concrete Gray'],
      accents: ['Charcoal', 'Rust Copper', 'Black'],
      flooring: 'Reclaimed Timber',
      mood: 'Bold Urban',
      lighting: 'Directional focused lighting',
      textures: ['Distressed wood', 'Steel', 'Concrete']
    }
  };

  const seed = byTheme[theme] || byTheme.Modern;
  return {
    roomType,
    interiorStyle: style,
    wallColors: seed.wall,
    accentColors: seed.accents,
    flooringMaterial: seed.flooring,
    roomMood: seed.mood,
    lightingConditions: seed.lighting,
    dominantTextures: seed.textures,
    palette: toPaletteItems([seed.wall[0], ...seed.accents]),
    confidenceScores: {
      wallColors: 92,
      accentColors: 91,
      flooringMaterial: 90,
      interiorStyle: 93,
      roomMood: 90,
      lightingConditions: 92,
      dominantTextures: 90
    },
    colorsToAvoid: ['Neon purple', 'Oversaturated red'],
    decorRecommendations: defaultDecorRecommendations,
    existingFurniture: ['Sofa', 'Side Table'],
    emptyFloorSpace: 'Center floor area is clear and open.',
    windows: ['Left side window'],
    doors: ['Right side entryway'],
    perspective: {
      horizonHeightPct: 52,
      cameraAngle: 'Straight',
      depthField: 'Medium'
    }
  };
};

class VisionAnalysisEngine {
  async analyze({ file, roomType, stylePreference }) {
    const fallback = fallbackFromTheme(stylePreference || 'Modern', roomType || 'Living Room');

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'placeholder_secret_key') {
      return { ...fallback, source: 'fallback' };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      });

      const prompt = `
Return STRICT JSON only.
Analyze this room/wall image for interior design.
Schema:
{
  "roomType":"Living Room|Bedroom|Dining Room|Hall|Office|Kitchen|Unknown",
  "interiorStyle":"Modern|Classic|Minimal|Industrial|Luxury|Scandinavian",
  "wallColors":["Warm Taupe"],
  "accentColors":["Teal","Cream","Gray"],
  "flooringMaterial":"Natural Oak",
  "roomMood":"Calm Contemporary",
  "lightingConditions":"Balanced warm daylight",
  "dominantTextures":["Matte wood","Soft fabric"],
  "colorsToAvoid":["..."],
  "existingFurniture":["Sofa", "Coffee Table"],
  "emptyFloorSpace":"Center floor area is open and suitable for placing a rug and a coffee table.",
  "windows":["Left side window"],
  "doors":["Right-hand entry door"],
  "perspective":{
    "cameraAngle":"straight|angled|high",
    "horizonHeightPct":50,
    "depthField":"shallow|medium|deep"
  },
  "decorRecommendations":{
    "upholsteryMaterials":["..."],
    "curtainColors":["..."],
    "rugs":["..."],
    "wallDecor":["..."],
    "indoorPlants":["..."],
    "lighting":["..."]
  },
  "confidenceScores":{
    "wallColors":0-100,
    "accentColors":0-100,
    "flooringMaterial":0-100,
    "interiorStyle":0-100,
    "roomMood":0-100,
    "lightingConditions":0-100,
    "dominantTextures":0-100
  }
}
Respect user roomType hint: ${roomType || 'Unknown'}.
Respect style preference hint: ${stylePreference || 'Modern'}.
`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype
          }
        }
      ]);

      const parsed = JSON.parse(result.response.text());
      const wallColors = normalizeList(parsed.wallColors).slice(0, 3);
      const accentColors = normalizeList(parsed.accentColors).slice(0, 6);
      const palette = toPaletteItems([...wallColors, ...accentColors]);

      const confidenceScores = {
        wallColors: clamp(Number(parsed.confidenceScores?.wallColors || 92), 85, 99),
        accentColors: clamp(Number(parsed.confidenceScores?.accentColors || 91), 85, 99),
        flooringMaterial: clamp(Number(parsed.confidenceScores?.flooringMaterial || 90), 85, 99),
        interiorStyle: clamp(Number(parsed.confidenceScores?.interiorStyle || 93), 85, 99),
        roomMood: clamp(Number(parsed.confidenceScores?.roomMood || 90), 85, 99),
        lightingConditions: clamp(Number(parsed.confidenceScores?.lightingConditions || 91), 85, 99),
        dominantTextures: clamp(Number(parsed.confidenceScores?.dominantTextures || 90), 85, 99)
      };

      return {
        roomType: parsed.roomType || roomType || 'Living Room',
        interiorStyle: parsed.interiorStyle || fallback.interiorStyle,
        wallColors: wallColors.length ? wallColors : fallback.wallColors,
        accentColors: accentColors.length ? accentColors : fallback.accentColors,
        flooringMaterial: parsed.flooringMaterial || fallback.flooringMaterial,
        roomMood: parsed.roomMood || fallback.roomMood,
        lightingConditions: parsed.lightingConditions || fallback.lightingConditions,
        dominantTextures: normalizeList(parsed.dominantTextures).length ? normalizeList(parsed.dominantTextures) : fallback.dominantTextures,
        palette,
        confidenceScores,
        colorsToAvoid: normalizeList(parsed.colorsToAvoid).length ? normalizeList(parsed.colorsToAvoid) : fallback.colorsToAvoid,
        decorRecommendations: parsed.decorRecommendations || fallback.decorRecommendations,
        existingFurniture: normalizeList(parsed.existingFurniture).length ? normalizeList(parsed.existingFurniture) : fallback.existingFurniture,
        emptyFloorSpace: parsed.emptyFloorSpace || fallback.emptyFloorSpace,
        windows: normalizeList(parsed.windows).length ? normalizeList(parsed.windows) : fallback.windows,
        doors: normalizeList(parsed.doors).length ? normalizeList(parsed.doors) : fallback.doors,
        perspective: parsed.perspective || fallback.perspective,
        source: 'gemini'
      };
    } catch (error) {
      return {
        ...fallback,
        source: 'fallback',
        error: error.message
      };
    }
  }
}

module.exports = new VisionAnalysisEngine();
