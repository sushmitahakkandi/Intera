const { normalizeColorPalette, clamp } = require('../utils/roomAnalysisToolkit');

class ColorHarmonyEngine {
  analyze(visionAnalysis) {
    const palette = normalizeColorPalette(visionAnalysis.colorPalette || visionAnalysis.colors || []);
    const harmonyType = palette.length <= 1 ? 'Monochrome' : palette.some((color) => color.role === 'contrast') ? 'Balanced contrast' : 'Neutral harmony';
    const accentColors = palette.slice(1).map((color) => color.name);

    return {
      palette,
      harmonyType,
      dominantColors: palette.slice(0, 3).map((color) => color.name),
      accentColors,
      colorConfidence: clamp(Number(visionAnalysis.colorConfidence || 80), 40, 99)
    };
  }
}

module.exports = new ColorHarmonyEngine();