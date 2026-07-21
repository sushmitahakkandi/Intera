const { clamp, estimateRoomSize, extractNumericDimensions } = require('../utils/roomAnalysisToolkit');

class SpatialAnalysisEngine {
  analyze(visionAnalysis) {
    const size = estimateRoomSize(visionAnalysis);
    const roomType = visionAnalysis.roomType || 'Living Room';
    const freeSpace = visionAnalysis.freeSpace || {};
    const dimensions = visionAnalysis.dimensionsEstimate || {};
    const dimensionsText = `${dimensions.widthFeet || ''}x${dimensions.lengthFeet || ''}x${dimensions.ceilingHeightFeet || ''}`;
    const numericDimensions = extractNumericDimensions(dimensionsText);

    const circulationScore = size === 'Compact' ? 68 : size === 'Spacious' ? 88 : 78;
    const roomLayout = {
      focalZone: roomType === 'Bedroom' ? 'Main bed wall' : 'Primary seating wall',
      circulationPath: 'Maintain 3 feet of clear walking space around core furniture.',
      zoneMap: [
        { name: 'Primary zone', purpose: roomType === 'Bedroom' ? 'Sleeping zone' : 'Social zone' },
        { name: 'Secondary zone', purpose: 'Storage and accent placement' },
        { name: 'Buffer zone', purpose: 'Keep entryway and walk paths unobstructed' }
      ]
    };

    return {
      roomSize: size,
      dimensionsEstimate: dimensions,
      parsedDimensions: numericDimensions,
      freeSpacePercentage: clamp(Number(freeSpace.percentage ?? (size === 'Compact' ? 32 : size === 'Spacious' ? 62 : 48)), 10, 90),
      circulationScore,
      roomLayout,
      spaceOptimizationTips: [
        'Keep the largest furniture element on the longest wall to open the center of the room.',
        'Preserve direct walking lanes from entry points to key functional zones.',
        'Use low-profile pieces near windows to keep daylight paths unobstructed.'
      ],
      spatialConfidence: clamp(Number(visionAnalysis.spatialConfidence || 78), 35, 99)
    };
  }
}

module.exports = new SpatialAnalysisEngine();