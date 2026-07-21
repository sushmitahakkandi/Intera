class RecommendationExplanationEngine {
  buildRecommendationExplanation({ recommendation, analysis }) {
    const reasons = recommendation.fitReasons || [];
    const style = analysis.styleAnalysis?.style || analysis.visionAnalysis?.style || 'the detected style';
    const roomType = analysis.visionAnalysis?.roomType || 'the room';
    const budget = recommendation.budgetTier && recommendation.budgetTier !== 'Unspecified' ? `It suits the ${recommendation.budgetTier.toLowerCase()} budget target.` : '';
    return {
      explanation: `Selected for ${roomType} because it aligns with the ${style} style and the detected spatial requirements. ${budget} ${reasons.join(' ')}`.trim(),
      highlightPoints: reasons
    };
  }

  buildSummary({ overallConfidence, improvementScoreBefore, improvementScoreAfter, spaceOptimizationTips }) {
    return {
      summary: `Overall confidence is ${overallConfidence}%. The room improvement score is expected to move from ${improvementScoreBefore} to ${improvementScoreAfter} after applying the recommendations.`,
      spaceOptimizationTips: spaceOptimizationTips || []
    };
  }
}

module.exports = new RecommendationExplanationEngine();