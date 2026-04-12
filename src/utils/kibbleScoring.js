export const calculateDigestionScore = (fiber) => {
  if (isNaN(fiber) || fiber === 0) return 0;
  if (fiber >= 3 && fiber <= 5) return 100;
  if (fiber > 2 && fiber < 3) return 90;
  if (fiber > 5 && fiber <= 6) return 85;
  if (fiber > 1 && fiber <= 2) return 75;
  if (fiber > 6) return Math.max(70 - ((fiber - 6) * 10), 20);
  return 50;
};

export const calculateDigestionScoreWithMicrobes = (fiber, microbeScore) => {
  const baseFiberScore = calculateDigestionScore(fiber);
  if (!microbeScore) return baseFiberScore;
  return Math.round(baseFiberScore * 0.6 + microbeScore * 0.4);
};

export const calculateReproductionScore = (selenium, zinc, weight) => {
  if (!weight) return 0;
  const seleniumMax = weight * 0.006;
  const zincMax = weight * 2;
  const seleniumScore = Math.min((selenium / seleniumMax) * 100, 100);
  const zincScore = Math.min((zinc / zincMax) * 100, 100);
  return Math.round((seleniumScore * 0.5 + zincScore * 0.5));
};

export const calculateJointScore = (glucosamine, chondroitin, omega3, weight) => {
  if (!weight) return 0;
  const glucoMax = 900;
  const chondroMax = 600;
  const omega3Max = weight * 28;
  const glucoScore = Math.min((glucosamine / glucoMax) * 100, 100);
  const chondroScore = Math.min((chondroitin / chondroMax) * 100, 100);
  const omega3Score = Math.min((omega3 / omega3Max) * 100, 100);
  return Math.round((glucoScore * 0.35 + chondroScore * 0.35 + omega3Score * 0.3));
};

export const calculateSkinCoatScore = (omega3, omega6, zinc, weight) => {
  if (!weight) return 0;
  const omega3Max = weight * 28;
  const omega6Max = weight * 0.2;
  const zincMax = weight * 2;
  const o3Score = Math.min((omega3 / omega3Max) * 100, 100);
  const o6Score = Math.min((omega6 / omega6Max) * 100, 100);
  const zincScore = Math.min((zinc / zincMax) * 100, 100);
  return Math.round((o3Score * 0.3 + o6Score * 0.4 + zincScore * 0.3));
};

export const calculateWeightScore = (fat, fiber) => {
  if (isNaN(fat) || isNaN(fiber)) return 0;
  let fatScore = 0;
  if (fat >= 12 && fat <= 18) {
    fatScore = 100;
  } else if (fat < 12) {
    fatScore = (fat / 12) * 100;
  } else {
    fatScore = Math.max(100 - ((fat - 18) * 10), 0);
  }
  let fiberScore = 0;
  if (fiber >= 3 && fiber <= 5) {
    fiberScore = 100;
  } else if (fiber < 3) {
    fiberScore = (fiber / 3) * 90 + 10;
  } else if (fiber <= 6) {
    fiberScore = 90;
  } else {
    fiberScore = Math.max(90 - ((fiber - 6) * 15), 0);
  }
  return Math.round((fatScore + fiberScore) / 2);
};

export const calculateImmuneScore = (vitE, zinc, selenium, weight) => {
  if (!weight) return 0;
  const vitEMax = weight * 1.4;
  const zincMax = weight * 2;
  const seleniumMax = weight * 0.006;
  const vitEScore = Math.min((vitE / vitEMax) * 100, 100);
  const zincScore = Math.min((zinc / zincMax) * 100, 100);
  const seleniumScore = Math.min((selenium / seleniumMax) * 100, 100);
  return Math.round((vitEScore * 0.4 + zincScore * 0.35 + seleniumScore * 0.25));
};

export const calculateAllergyScore = (foodName) => {
  const grainFree = !/wheat|corn|soy/i.test(foodName || '');
  return grainFree ? 80 : 65;
};

export const calculateHeartScore = (taurine, omega3, weight) => {
  if (!weight) return 0;
  const taurineMax = 500;
  const omega3Max = weight * 28;
  const taurineScore = Math.min((taurine / taurineMax) * 100, 100);
  const omega3Score = Math.min((omega3 / omega3Max) * 100, 100);
  return Math.round((taurineScore * 0.5 + omega3Score * 0.5));
};

export const calculateEyeScore = (vitE, omega3, weight) => {
  if (!weight) return 0;
  const vitEMax = weight * 1.4;
  const omega3Max = weight * 28;
  const vitEScore = Math.min((vitE / vitEMax) * 100, 100);
  const omega3Score = Math.min((omega3 / omega3Max) * 100, 100);
  return Math.round((vitEScore * 0.5 + omega3Score * 0.5));
};

export const calculateCaloricScore = (dailyCal, cupsNeeded, brandCups) => {
  if (brandCups <= 0) return 90;
  const diff = Math.abs(cupsNeeded - brandCups) / cupsNeeded;
  const score = Math.max(100 - (diff * 100), 0);
  return Math.round(score);
};

export const LEGUME_FLAG_LIST = [
  { pattern: /\bgarbanzo beans?\b/i, name: 'Garbanzo Beans', concern: 'High-glycemic legume linked to DCM risk', health_impact: 'Associated with dilated cardiomyopathy (DCM) in dogs; FDA investigated legume-heavy grain-free diets.', citation: 'FDA, 2019 - Investigation into potential link between legume-heavy diets and DCM in dogs.' },
  { pattern: /\bpeas?\b/i, name: 'Peas', concern: 'Legume filler linked to DCM risk', health_impact: 'Frequently used as cheap protein/starch filler; FDA flagged peas as a common ingredient in DCM-associated diets.', citation: 'FDA, 2019 - Investigation into potential link between legume-heavy diets and DCM in dogs.' },
  { pattern: /\blentils?\b/i, name: 'Lentils', concern: 'Legume filler linked to DCM risk', health_impact: 'Associated with DCM in dogs when used as a primary ingredient; acts as a cheap protein substitute.', citation: 'FDA, 2019 - Investigation into potential link between legume-heavy diets and DCM in dogs.' },
];

export const SCORE_OVERRIDES = [
  { pattern: /powdered cellulose/i, score: -1 },
  { pattern: /garbanzo/i, score: -2 },
  { pattern: /pea/i, score: -2 },
  { pattern: /lentil/i, score: -2 },
  { pattern: /\bcracked pearl barley\b/i, score: -0.5 },
  { pattern: /\bwhole grain wheat\b/i, score: -1 },
  { pattern: /\bwhole grain corn\b/i, score: -1 },
  { pattern: /\bcorn protein meal\b/i, score: -2 },
  { pattern: /\bbrewer'?s rice\b/i, score: -1 },
  { pattern: /\bpea fiber\b/i, score: -1 },
  { pattern: /\bsoybean oil\b/i, score: -1 },
];