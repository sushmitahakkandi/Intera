const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  safeJsonParse,
  normalizeRoomType,
  normalizeStyle,
  normalizeColorPalette,
  normalizeMaterials,
  parseBudgetPreference,
  buildFallbackAnalysis,
  clamp
} = require('../utils/roomAnalysisToolkit');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

class VisionAnalysisEngine {
  constructor() {
    this.enabled = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'placeholder_secret_key');
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'MOCK_KEY');
  }

  async analyze({ file, roomTypeHint, userPreferences = {} }) {
    const fallback = buildFallbackAnalysis({
      file,
      roomTypeHint,
      budgetPreference: userPreferences.budgetRange || userPreferences.budget,
      stylePreference: userPreferences.stylePreference
    });

    if (!this.enabled || !file?.buffer) {
      return {
        ...fallback,
        analysisSource: 'fallback'
      };
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const promptText = `
You are a production interior vision analysis engine for a smart furniture platform.
Return strict JSON only. Do not include markdown or comments.

Analyze the uploaded room image and produce this schema:
{
  "roomType": "Living Room|Bedroom|Dining Room|Office|Kitchen|Hall|Unknown",
  "roomSize": "Compact|Standard|Spacious",
  "style": "Modern|Luxury|Minimal|Classic|Industrial|Scandinavian",
  "styleConfidence": 0-100,
  "colors": ["Beige", "Brown", "Grey"],
  "colorPalette": [
    {"name": "Beige", "hex": "#E8D8C2", "role": "base"},
    {"name": "Brown", "hex": "#8B5E3C", "role": "accent"}
  ],
  "materials": ["Wood", "Fabric"],
  "materialsDetected": [
    {"name": "Wood", "confidence": 90},
    {"name": "Fabric", "confidence": 82}
  ],
  "wallColors": ["Beige"],
  "flooring": "Wood|Tile|Marble|Carpet|Concrete|Laminate",
  "windows": {"count": 1, "placement": "left wall", "lightLevel": "natural"},
  "doors": {"count": 1, "placement": "right side"},
  "lighting": {"type": ["natural", "ambient"], "brightness": "medium"},
  "furniturePresent": ["Sofa", "Table"],
  "freeSpace": {"level": "low|medium|high", "percentage": 45, "notes": "..."},
  "dimensionsEstimate": {"widthFeet": 12, "lengthFeet": 14, "ceilingHeightFeet": 9},
  "spatialObservations": ["..."],
  "roomIssues": ["..."],
  "recommendedCategories": ["Sofa", "Tables", "Storage"],
  "furnitureNeedSummary": ["..."]
}

Prioritize the user's room hint: ${roomTypeHint || 'Unknown'}.
Use the user preference budget/style only as soft hints:
${JSON.stringify(userPreferences)}
`;

    try {
      const result = await model.generateContent([
        promptText,
        {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype
          }
        }
      ]);

      const responseText = result.response.text();
      const parsed = safeJsonParse(responseText, null) || {};

      return {
        roomType: normalizeRoomType(parsed.roomType || roomTypeHint || fallback.roomType, fallback.roomType),
        roomSize: parsed.roomSize || fallback.roomSize,
        style: normalizeStyle(parsed.style || fallback.style, fallback.style),
        styleConfidence: clamp(Number(parsed.styleConfidence || fallback.styleConfidence || 72), 35, 99),
        colors: parsed.colors || fallback.colors,
        colorPalette: normalizeColorPalette(parsed.colorPalette || parsed.colors || fallback.colorPalette),
        materials: parsed.materials || fallback.materials,
        materialsDetected: normalizeMaterials(parsed.materialsDetected?.map?.((item) => item?.name || item) || parsed.materials || fallback.materials),
        wallColors: parsed.wallColors || fallback.wallColors,
        flooring: parsed.flooring || fallback.flooring,
        windows: parsed.windows || fallback.windows,
        doors: parsed.doors || fallback.doors,
        lighting: parsed.lighting || fallback.lighting,
        furniturePresent: parsed.furniturePresent || fallback.furniturePresent,
        freeSpace: parsed.freeSpace || fallback.freeSpace,
        dimensionsEstimate: parsed.dimensionsEstimate || fallback.dimensionsEstimate,
        spatialObservations: parsed.spatialObservations || fallback.spatialObservations,
        roomIssues: parsed.roomIssues || fallback.roomIssues,
        recommendedCategories: parsed.recommendedCategories || fallback.recommendedCategories,
        furnitureNeedSummary: parsed.furnitureNeedSummary || fallback.furnitureNeedSummary,
        budgetPreference: parseBudgetPreference(userPreferences.budgetRange || userPreferences.budget),
        roomTypeConfidence: clamp(Number(parsed.roomTypeConfidence || 82), 40, 99),
        colorConfidence: clamp(Number(parsed.colorConfidence || 80), 35, 99),
        materialConfidence: clamp(Number(parsed.materialConfidence || 76), 35, 99),
        spatialConfidence: clamp(Number(parsed.spatialConfidence || 78), 35, 99),
        visionConfidence: clamp(Number(parsed.visionConfidence || 84), 40, 99),
        analysisSource: 'gemini',
        rawGemini: parsed
      };
    } catch (error) {
      return {
        ...fallback,
        analysisSource: 'fallback',
        visionConfidence: fallback.visionConfidence || 60,
        error: error.message
      };
    }
  }
}

module.exports = new VisionAnalysisEngine();