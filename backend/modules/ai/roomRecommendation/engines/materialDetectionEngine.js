const { normalizeMaterials, clamp } = require('../utils/roomAnalysisToolkit');

class MaterialDetectionEngine {
  analyze(visionAnalysis) {
    const materials = normalizeMaterials(visionAnalysis.materialsDetected?.map?.((item) => item?.name || item) || visionAnalysis.materials || []);
    const surfaceMaterials = {
      flooring: visionAnalysis.flooring || 'Wood',
      upholstery: materials.find((item) => /fabric|velvet|leather/i.test(item.name))?.name || 'Fabric',
      frame: materials.find((item) => /wood|metal|steel/i.test(item.name))?.name || 'Wood'
    };

    return {
      materials,
      surfaceMaterials,
      materialConfidence: clamp(Number(visionAnalysis.materialConfidence || 76), 35, 99)
    };
  }
}

module.exports = new MaterialDetectionEngine();