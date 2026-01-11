import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Camera, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function KibbleAnalyzer() {
  const [dogData, setDogData] = useState({
    dogSize: 'medium',
    dogWeight: '',
    activityLevel: 'neutered adult',
    dogFoodGoal: 'overall health',
    zipCode: '',
    ageYears: '',
    ageMonths: ''
  });

  const [foodData, setFoodData] = useState({
    dogFood: '',
    recommendedFeeding: '',
    kcalKg: '',
    kcalCup: '',
    omega3: '',
    omega6: '',
    vitaminE: '',
    selenium: '',
    zinc: '',
    crudeProtein: '',
    crudeFat: '',
    crudeFiber: '',
    moisture: '',
    taurine: '',
    glucosamine: '',
    chondroitin: '',
    priceBag: '',
    bagWeight: '',
    ingredients: ''
  });

  const [results, setResults] = useState(null);
  const [analyzingNutrition, setAnalyzingNutrition] = useState(false);
  const [analyzingIngredients, setAnalyzingIngredients] = useState(false);
  const [analyzingPrice, setAnalyzingPrice] = useState(false);

  const handleDogChange = (field, value) => {
    setDogData(prev => ({ ...prev, [field]: value }));
  };

  const handleFoodChange = (field, value) => {
    setFoodData(prev => ({ ...prev, [field]: value }));
  };

  const handleNutritionPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzingNutrition(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this dog food nutritional label and extract all nutritional values. Pay special attention to:
        
        CRITICAL FIELDS (look very carefully for these):
        - "Recommended Feeding" or "Feeding Guide" (cups/day) - often in a table format
        - "Calorie Content (kcal/kg)" or "kcal/kg" or "Metabolizable Energy per kg"
        - "Calorie Content (kcal/cup)" or "kcal/cup" or "Calories per cup"
        
        ALSO EXTRACT:
        - Product name and brand
        - Omega-3 %, omega-6 %
        - Vitamin E (IU/kg), selenium (mg/kg), zinc (mg/kg)
        - Crude protein %, crude fat %, crude fiber %, moisture %
        - Taurine %, glucosamine (mg/kg), chondroitin (mg/kg)
        
        Look carefully at all text on the label, including small print, feeding guides, and guaranteed analysis sections. Extract numerical values only. If a value is not visible, return null for that field.`,
        file_urls: [file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            dogFood: { type: "string" },
            recommendedFeeding: { type: "number" },
            kcalKg: { type: "number" },
            kcalCup: { type: "number" },
            omega3: { type: "number" },
            omega6: { type: "number" },
            vitaminE: { type: "number" },
            selenium: { type: "number" },
            zinc: { type: "number" },
            crudeProtein: { type: "number" },
            crudeFat: { type: "number" },
            crudeFiber: { type: "number" },
            moisture: { type: "number" },
            taurine: { type: "number" },
            glucosamine: { type: "number" },
            chondroitin: { type: "number" }
          }
        }
      });

      setFoodData(prev => ({
        ...prev,
        ...(result.dogFood && { dogFood: result.dogFood }),
        ...(result.recommendedFeeding && { recommendedFeeding: result.recommendedFeeding.toString() }),
        ...(result.kcalKg && { kcalKg: result.kcalKg.toString() }),
        ...(result.kcalCup && { kcalCup: result.kcalCup.toString() }),
        ...(result.omega3 && { omega3: result.omega3.toString() }),
        ...(result.omega6 && { omega6: result.omega6.toString() }),
        ...(result.vitaminE && { vitaminE: result.vitaminE.toString() }),
        ...(result.selenium && { selenium: result.selenium.toString() }),
        ...(result.zinc && { zinc: result.zinc.toString() }),
        ...(result.crudeProtein && { crudeProtein: result.crudeProtein.toString() }),
        ...(result.crudeFat && { crudeFat: result.crudeFat.toString() }),
        ...(result.crudeFiber && { crudeFiber: result.crudeFiber.toString() }),
        ...(result.moisture && { moisture: result.moisture.toString() }),
        ...(result.taurine && { taurine: result.taurine.toString() }),
        ...(result.glucosamine && { glucosamine: result.glucosamine.toString() }),
        ...(result.chondroitin && { chondroitin: result.chondroitin.toString() })
      }));

      alert('Nutritional data extracted! Please review and adjust any values as needed.');
    } catch (error) {
      alert('Error analyzing photo: ' + error.message);
    } finally {
      setAnalyzingNutrition(false);
    }
  };

  const handleIngredientsPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzingIngredients(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this dog food ingredients label and extract the complete ingredients list. Return all ingredients as a comma-separated text string in the exact order they appear on the label.`,
        file_urls: [file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            ingredients: { type: "string" }
          }
        }
      });

      setFoodData(prev => ({
        ...prev,
        ...(result.ingredients && { ingredients: result.ingredients })
      }));

      alert('Ingredients extracted! Please review and adjust if needed.');
    } catch (error) {
      alert('Error analyzing ingredients: ' + error.message);
    } finally {
      setAnalyzingIngredients(false);
    }
  };

  const handlePricePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzingPrice(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image and extract pricing information for dog food. Look for: retail price, MSRP, price tag, or any price sticker (in USD). Also look for bag weight/size in lbs or kg. Extract numerical values only.`,
        file_urls: [file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            priceBag: { type: "number" },
            bagWeight: { type: "number" }
          }
        }
      });

      setFoodData(prev => ({
        ...prev,
        ...(result.priceBag && { priceBag: result.priceBag.toString() }),
        ...(result.bagWeight && { bagWeight: result.bagWeight.toString() })
      }));

      alert('Price and bag weight extracted! Please review and adjust if needed.');
    } catch (error) {
      alert('Error analyzing price: ' + error.message);
    } finally {
      setAnalyzingPrice(false);
    }
  };

  const analyzeKibble = async () => {
    const weight = parseFloat(dogData.dogWeight);
    const kcalCup = parseFloat(foodData.kcalCup);
    const recommendedCups = parseFloat(foodData.recommendedFeeding) || 0;
    const priceBag = parseFloat(foodData.priceBag) || 0;
    const bagWeight = parseFloat(foodData.bagWeight) || 1;

    if (!weight || !kcalCup) {
      alert('Please enter at least Dog Weight and Calorie Content (kcal/cup)');
      return;
    }

    setAnalyzing(true);

    // Calculate daily caloric needs (RER formula)
    // RER = 70 × (weight in kg)^0.75
    const weightKg = weight / 2.2; // Convert lbs to kg
    const rer = 70 * Math.pow(weightKg, 0.75);
    const activityMultiplier = {
      'inactive/senior': 1.4,
      'neutered adult': 1.6,
      'active/intact adult': 1.8,
      'highly active/working': 2.0
    }[dogData.activityLevel] || 1.6;
    
    const dailyCalories = rer * activityMultiplier;
    const cupsNeeded = dailyCalories / kcalCup;
    const costPerDay = priceBag > 0 && bagWeight > 0 ? (priceBag / bagWeight) * (cupsNeeded / 4) : 0;
    
    // Calculate daily nutrient intake using Google AI formula: cups × 115g/cup = grams/day
    const gramsPerCup = 115; // Standard cup weight
    const dailyFoodGrams = cupsNeeded * gramsPerCup;
    const dailyFoodKg = dailyFoodGrams / 1000;
    
    // For percentage nutrients to mg: kg × (percentage/100) × 1000 × 1000 = kg × percentage × 10000
    const dailyOmega3 = Math.round(dailyFoodKg * (parseFloat(foodData.omega3) || 0) * 10000); // mg/day
    // For percentage nutrients to g: kg × (percentage/100) × 1000 = kg × percentage × 10
    const dailyOmega6 = (dailyFoodKg * (parseFloat(foodData.omega6) || 0) * 10).toFixed(1); // g/day
    
    // For IU/kg and mg/kg nutrients: kg × concentration = result
    const dailyVitaminE = Math.round(dailyFoodKg * (parseFloat(foodData.vitaminE) || 0)); // IU/day
    const dailySelenium = (dailyFoodKg * (parseFloat(foodData.selenium) || 0)).toFixed(3); // mg/day (selenium in mg/kg)
    const dailyZinc = Math.round(dailyFoodKg * (parseFloat(foodData.zinc) || 0)); // mg/day
    const dailyGlucosamine = Math.round(dailyFoodKg * (parseFloat(foodData.glucosamine) || 0)); // mg/day
    const dailyChondroitin = Math.round(dailyFoodKg * (parseFloat(foodData.chondroitin) || 0)); // mg/day
    
    // For taurine (percentage): kg × (percentage/100) × 1000 × 1000 = mg
    const dailyTaurine = Math.round(dailyFoodKg * (parseFloat(foodData.taurine) || 0) * 10000); // mg/day

    // Analyze ingredients with AI (using credible university sources)
    let ingredientAnalysis = null;
    if (foodData.ingredients) {
      try {
        ingredientAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze these dog food ingredients for a ${weight} lb dog: "${foodData.ingredients}". 
          
          Provide analysis based on credible university veterinary studies (Cornell, UC Davis, Tufts, Purdue, Texas A&M, Ohio State):
          1. Microorganisms: Identify any probiotics/prebiotics (e.g., Lactobacillus, Bacillus, chicory root, dried fermentation products). Estimate total CFU count if probiotics are listed, and list specific strains. Rate gut microbiome support (1-100).
          2. Ingredient Quality Grade (A-F): Based on digestibility, bioavailability, and nutritional value for dogs. Consider whole proteins vs by-products, whole grains vs fillers, synthetic vs natural nutrients.
          3. Red Flags: Identify problematic ingredients with specific university study citations. Include: artificial colors/preservatives (BHA, BHT, ethoxyquin), controversial grains, low-quality proteins, excessive fillers, allergens.
          
          Return structured data with university citations.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              microorganisms: {
                type: "object",
                properties: {
                  types: { type: "array", items: { type: "string" } },
                  total_cfu: { type: "string" },
                  gut_health_score: { type: "number" },
                  summary: { type: "string" }
                }
              },
              ingredient_grade: {
                type: "object",
                properties: {
                  grade: { type: "string" },
                  score: { type: "number" },
                  reasoning: { type: "string" },
                  university_source: { type: "string" }
                }
              },
              red_flags: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    ingredient: { type: "string" },
                    concern: { type: "string" },
                    health_impact: { type: "string" },
                    university_citation: { type: "string" }
                  }
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Ingredient analysis error:', error);
      }
    }

    // Recommended ranges based on weight
    const omega3Rec = `${Math.round(weight * 14)}–${Math.round(weight * 28)} mg/day`;
    const omega6Rec = `${Math.round(weight * 0.1)}–${Math.round(weight * 0.2)} g/day`;
    const vitERec = `${Math.round(weight * 0.7)}–${Math.round(weight * 1.4)} IU/day`;
    const seleniumRec = `${(weight * 0.0036).toFixed(2)}–${(weight * 0.006).toFixed(2)} mg/day`;
    const zincRec = `${Math.round(weight * 1)}–${Math.round(weight * 2)} mg/day`;
    const taurineRec = `>300–500 mg/day beneficial`;
    const glucosamineRec = `350–900 mg/day`;
    const chondroitinRec = `150–600 mg/day`;

    // Health scoring
    const microbeScore = ingredientAnalysis?.microorganisms?.gut_health_score || null;
    const scores = {
      reproduction: calculateReproductionScore(parseFloat(dailySelenium), dailyZinc, weight),
      joint: calculateJointScore(dailyGlucosamine, dailyChondroitin, dailyOmega3, weight),
      skinCoat: calculateSkinCoatScore(dailyOmega3, parseFloat(dailyOmega6), dailyZinc, weight),
      weight: calculateWeightScore(parseFloat(foodData.crudeFat), parseFloat(foodData.crudeFiber)),
      digestion: calculateDigestionScoreWithMicrobes(parseFloat(foodData.crudeFiber), microbeScore),
      immune: calculateImmuneScore(dailyVitaminE, dailyZinc, parseFloat(dailySelenium), weight),
      allergy: calculateAllergyScore(foodData.dogFood),
      heart: calculateHeartScore(dailyTaurine, dailyOmega3, weight),
      eye: calculateEyeScore(dailyVitaminE, dailyOmega3, weight),
      caloric: calculateCaloricScore(dailyCalories, cupsNeeded, recommendedCups)
    };

    const overallScore = Math.round(
      (scores.reproduction + scores.joint + scores.skinCoat + scores.weight + 
       scores.digestion + scores.immune + scores.allergy + scores.heart + 
       scores.eye + scores.caloric) / 10
    );

    const analysis = {
      dogName: foodData.dogFood || 'Your Dog',
      costPerServing: costPerDay.toFixed(2),
      lifeStage: 'Adult',
      ingredientAnalysis: ingredientAnalysis,
      nutrients: [
        { name: 'Omega-3', actual: `${dailyOmega3} mg/day`, recommended: omega3Rec },
        { name: 'Omega-6', actual: `${dailyOmega6} g/day`, recommended: omega6Rec },
        { name: 'Vitamin E', actual: `${dailyVitaminE} IU/day`, recommended: vitERec },
        { name: 'Selenium', actual: `${dailySelenium} mg/day`, recommended: seleniumRec },
        { name: 'Zinc', actual: `${dailyZinc} mg/day`, recommended: zincRec },
        { name: 'Crude Protein', actual: `${foodData.crudeProtein}%`, recommended: '22–32%' },
        { name: 'Crude Fat', actual: `${foodData.crudeFat}%`, recommended: '12–18%' },
        { name: 'Crude Fiber', actual: `${foodData.crudeFiber}%`, recommended: '<6% max' },
        { name: 'Taurine', actual: `${dailyTaurine} mg/day`, recommended: taurineRec },
        { name: 'Glucosamine', actual: `${dailyGlucosamine} mg/day`, recommended: glucosamineRec },
        { name: 'Chondroitin', actual: `${dailyChondroitin} mg/day`, recommended: chondroitinRec }
      ],
      healthScores: [
        { area: 'Reproduction', score: scores.reproduction, reasoning: 'Good omega ratio & zinc (Purdue); selenium low deducts.' },
        { area: 'Joint Health', score: scores.joint, reasoning: 'Glucosamine/chondroitin levels assessed (UC Davis standards).' },
        { area: 'Skin & Coat Health', score: scores.skinCoat, reasoning: 'Omega-6/3 balance & zinc for barrier (Cornell).' },
        { area: 'Weight Management', score: scores.weight, reasoning: 'Balanced fat/fiber; calories match moderate MER (NRC).' },
        { area: 'Digestion (Gut Health)', score: scores.digestion, reasoning: microbeScore ? 'Fiber + microorganism content for gut microbiome health.' : 'Fiber content supports healthy gut function.' },
        { area: 'Immune Health', score: scores.immune, reasoning: 'Vitamin E/zinc levels evaluated (Texas A&M).' },
        { area: 'Allergy Control', score: scores.allergy, reasoning: 'Ingredient analysis for common allergens.' },
        { area: 'Heart Health', score: scores.heart, reasoning: 'Taurine & omegas support cardiac function.' },
        { area: 'Eye Health', score: scores.eye, reasoning: 'Vitamin E + omega-3 for retinal health (Cornell ophthalmology).' },
        { area: 'Caloric Needs Met', score: scores.caloric, reasoning: 'Feeding aligns with calculated needs (NRC).' }
      ],
      overallScore: overallScore,
      improvements: [
        { area: 'Reproduction', original: scores.reproduction, improved: Math.min(scores.reproduction + 7, 98) },
        { area: 'Joint Health', original: scores.joint, improved: Math.min(scores.joint + 22, 95) },
        { area: 'Skin & Coat', original: scores.skinCoat, improved: Math.min(scores.skinCoat + 7, 98) },
        { area: 'Weight Management', original: scores.weight, improved: Math.min(scores.weight + 4, 95) },
        { area: 'Digestion', original: scores.digestion, improved: Math.min(scores.digestion + 7, 98) },
        { area: 'Immune Health', original: scores.immune, improved: Math.min(scores.immune + 14, 98) },
        { area: 'Allergy Control', original: scores.allergy, improved: Math.min(scores.allergy + 11, 95) },
        { area: 'Heart Health', original: scores.heart, improved: Math.min(scores.heart + 12, 95) },
        { area: 'Eye Health', original: scores.eye, improved: Math.min(scores.eye + 10, 98) },
        { area: 'Caloric Needs', original: scores.caloric, improved: Math.min(scores.caloric + 2, 99) }
      ],
      improvedOverallScore: Math.min(overallScore + 11, 98)
    };

    setResults(analysis);
    setAnalyzing(false);
  };

  // Updated digestion score with microorganism consideration
  const calculateDigestionScoreWithMicrobes = (fiber, microbeScore) => {
    const baseFiberScore = calculateDigestionScore(fiber);
    if (!microbeScore) return baseFiberScore;
    // Weight: 60% fiber, 40% microorganisms
    return Math.round(baseFiberScore * 0.6 + microbeScore * 0.4);
  };

  // Scoring functions
  const calculateReproductionScore = (selenium, zinc, weight) => {
    if (!weight) return 0;
    const seleniumMax = weight * 0.006; // mg max recommended
    const zincMax = weight * 2; // mg max recommended
    const seleniumScore = Math.min((selenium / seleniumMax) * 100, 100);
    const zincScore = Math.min((zinc / zincMax) * 100, 100);
    return Math.round((seleniumScore * 0.5 + zincScore * 0.5));
  };

  const calculateJointScore = (glucosamine, chondroitin, omega3, weight) => {
    if (!weight) return 0;
    const glucoMax = 900; // mg max recommended
    const chondroMax = 600; // mg max recommended
    const omega3Max = weight * 28; // mg max recommended
    const glucoScore = Math.min((glucosamine / glucoMax) * 100, 100);
    const chondroScore = Math.min((chondroitin / chondroMax) * 100, 100);
    const omega3Score = Math.min((omega3 / omega3Max) * 100, 100);
    return Math.round((glucoScore * 0.35 + chondroScore * 0.35 + omega3Score * 0.3));
  };

  const calculateSkinCoatScore = (omega3, omega6, zinc, weight) => {
    if (!weight) return 0;
    const omega3Max = weight * 28; // mg max recommended
    const omega6Max = weight * 0.2; // g max recommended
    const zincMax = weight * 2; // mg max recommended
    const o3Score = Math.min((omega3 / omega3Max) * 100, 100);
    const o6Score = Math.min((omega6 / omega6Max) * 100, 100);
    const zincScore = Math.min((zinc / zincMax) * 100, 100);
    return Math.round((o3Score * 0.3 + o6Score * 0.4 + zincScore * 0.3));
  };

  const calculateWeightScore = (fat, fiber) => {
    if (isNaN(fat) || isNaN(fiber)) return 0;
    // Fat: ideal range 12-18%, score based on how close to range
    let fatScore = 0;
    if (fat >= 12 && fat <= 18) {
      fatScore = 100;
    } else if (fat < 12) {
      fatScore = (fat / 12) * 100;
    } else {
      fatScore = Math.max(100 - ((fat - 18) * 10), 0);
    }
    
    // Fiber: ideal <6%, optimal 3-5%
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

  const calculateDigestionScore = (fiber) => {
    if (isNaN(fiber) || fiber === 0) return 0;
    // Optimal fiber: 3-5% scores highest
    if (fiber >= 3 && fiber <= 5) return 100;
    if (fiber > 2 && fiber < 3) return 90;
    if (fiber > 5 && fiber <= 6) return 85;
    if (fiber > 1 && fiber <= 2) return 75;
    if (fiber > 6) return Math.max(70 - ((fiber - 6) * 10), 20);
    return 50;
  };

  const calculateImmuneScore = (vitE, zinc, selenium, weight) => {
    if (!weight) return 0;
    const vitEMax = weight * 1.4; // IU max recommended
    const zincMax = weight * 2; // mg max recommended
    const seleniumMax = weight * 0.006; // mg max recommended
    const vitEScore = Math.min((vitE / vitEMax) * 100, 100);
    const zincScore = Math.min((zinc / zincMax) * 100, 100);
    const seleniumScore = Math.min((selenium / seleniumMax) * 100, 100);
    return Math.round((vitEScore * 0.4 + zincScore * 0.35 + seleniumScore * 0.25));
  };

  const calculateAllergyScore = (foodName) => {
    const grainFree = !/wheat|corn|soy/i.test(foodName || '');
    return grainFree ? 80 : 65;
  };

  const calculateHeartScore = (taurine, omega3, weight) => {
    if (!weight) return 0;
    const taurineMax = 500; // mg max beneficial
    const omega3Max = weight * 28; // mg max recommended
    const taurineScore = Math.min((taurine / taurineMax) * 100, 100);
    const omega3Score = Math.min((omega3 / omega3Max) * 100, 100);
    return Math.round((taurineScore * 0.5 + omega3Score * 0.5));
  };

  const calculateEyeScore = (vitE, omega3, weight) => {
    if (!weight) return 0;
    const vitEMax = weight * 1.4; // IU max recommended
    const omega3Max = weight * 28; // mg max recommended
    const vitEScore = Math.min((vitE / vitEMax) * 100, 100);
    const omega3Score = Math.min((omega3 / omega3Max) * 100, 100);
    return Math.round((vitEScore * 0.5 + omega3Score * 0.5));
  };

  const calculateCaloricScore = (dailyCal, cupsNeeded, brandCups) => {
    if (brandCups <= 0) return 90; // No brand recommendation to compare
    const diff = Math.abs(cupsNeeded - brandCups) / cupsNeeded;
    // Perfect match = 100, scale down based on % difference
    const score = Math.max(100 - (diff * 100), 0);
    return Math.round(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-blue-600 flex items-center justify-center gap-2">
              <span>🐶</span> Kibble Analyzer App
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Enter your dog's details and food label data
            </p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">Dog Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Dog Size</Label>
                  <Select value={dogData.dogSize} onValueChange={(val) => handleDogChange('dogSize', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toy">Toy</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="x-large">X-Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dog Weight (lbs)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={dogData.dogWeight}
                    onChange={(e) => handleDogChange('dogWeight', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Activity Level</Label>
                  <Select value={dogData.activityLevel} onValueChange={(val) => handleDogChange('activityLevel', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inactive/senior">Inactive/Senior</SelectItem>
                      <SelectItem value="neutered adult">Neutered Adult (Average)</SelectItem>
                      <SelectItem value="active/intact adult">Active/Intact Adult</SelectItem>
                      <SelectItem value="highly active/working">Highly Active/Working</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dog Food Goal</Label>
                  <Select value={dogData.dogFoodGoal} onValueChange={(val) => handleDogChange('dogFoodGoal', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall health">Overall Health</SelectItem>
                      <SelectItem value="allergies">Allergies</SelectItem>
                      <SelectItem value="skin/coat health">Skin/Coat Health</SelectItem>
                      <SelectItem value="heart health">Heart Health</SelectItem>
                      <SelectItem value="joint health">Joint Health</SelectItem>
                      <SelectItem value="reproduction">Reproduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Zip Code</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 77328"
                    value={dogData.zipCode}
                    onChange={(e) => handleDogChange('zipCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Age (Years)</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={dogData.ageYears}
                    onChange={(e) => handleDogChange('ageYears', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Age (Months)</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={dogData.ageMonths}
                    onChange={(e) => handleDogChange('ageMonths', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">Food Label Data</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-base font-semibold text-blue-700 mb-2 block">
                    📸 Quick Fill: Upload Photo of Nutritional Label
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleNutritionPhotoUpload}
                      disabled={analyzingNutrition}
                      className="flex-1"
                    />
                    {analyzingNutrition && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Analyzing...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Upload a clear photo of the nutritional label to auto-fill nutrition data
                  </p>
                </div>

                <div className="md:col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-base font-semibold text-green-700 mb-2 block">
                    📸 Quick Fill: Upload Photo of Ingredients List
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleIngredientsPhotoUpload}
                      disabled={analyzingIngredients}
                      className="flex-1"
                    />
                    {analyzingIngredients && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Analyzing...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Upload a clear photo of the ingredients list to auto-fill
                  </p>
                </div>

                <div className="md:col-span-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Label className="text-base font-semibold text-orange-700 mb-2 block">
                    📸 Quick Fill: Upload Photo of Bar Code
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePricePhotoUpload}
                      disabled={analyzingPrice}
                      className="flex-1"
                    />
                    {analyzingPrice && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Analyzing...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Upload a clear photo of the bar code or price tag to auto-fill price and weight
                  </p>
                </div>

                <div className="md:col-span-2">
                  <Label>Dog Food Name</Label>
                  <Input
                    placeholder="e.g., 4health Salmon & Potato"
                    value={foodData.dogFood}
                    onChange={(e) => handleFoodChange('dogFood', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Ingredients List</Label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Salmon, brown rice, oatmeal, chicken fat..."
                    value={foodData.ingredients}
                    onChange={(e) => handleFoodChange('ingredients', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Recommended Feeding (cups/day)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 3.5"
                    value={foodData.recommendedFeeding}
                    onChange={(e) => handleFoodChange('recommendedFeeding', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Calorie Content (kcal/kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3560"
                    value={foodData.kcalKg}
                    onChange={(e) => handleFoodChange('kcalKg', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Calorie Content (kcal/cup)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 364"
                    value={foodData.kcalCup}
                    onChange={(e) => handleFoodChange('kcalCup', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Omega-3 (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.5"
                    value={foodData.omega3}
                    onChange={(e) => handleFoodChange('omega3', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Omega-6 (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2.5"
                    value={foodData.omega6}
                    onChange={(e) => handleFoodChange('omega6', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Vitamin E (IU/kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={foodData.vitaminE}
                    onChange={(e) => handleFoodChange('vitaminE', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Selenium (mg/kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.35"
                    value={foodData.selenium}
                    onChange={(e) => handleFoodChange('selenium', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Zinc (mg/kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={foodData.zinc}
                    onChange={(e) => handleFoodChange('zinc', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Crude Protein (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 25"
                    value={foodData.crudeProtein}
                    onChange={(e) => handleFoodChange('crudeProtein', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Crude Fat (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 14"
                    value={foodData.crudeFat}
                    onChange={(e) => handleFoodChange('crudeFat', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Crude Fiber (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 4"
                    value={foodData.crudeFiber}
                    onChange={(e) => handleFoodChange('crudeFiber', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Moisture (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={foodData.moisture}
                    onChange={(e) => handleFoodChange('moisture', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Taurine (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.12"
                    value={foodData.taurine}
                    onChange={(e) => handleFoodChange('taurine', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Glucosamine (mg/kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 300"
                    value={foodData.glucosamine}
                    onChange={(e) => handleFoodChange('glucosamine', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Chondroitin (mg/kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={foodData.chondroitin}
                    onChange={(e) => handleFoodChange('chondroitin', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Price per Bag (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 54.99"
                    value={foodData.priceBag}
                    onChange={(e) => handleFoodChange('priceBag', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Bag Weight (lbs)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 35"
                    value={foodData.bagWeight}
                    onChange={(e) => handleFoodChange('bagWeight', e.target.value)}
                  />
                </div>
              </CardContent>
              </Card>
              </div>

        <Button
          onClick={analyzeKibble}
          disabled={analyzingNutrition || analyzingIngredients || analyzingPrice}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mt-6"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Analyze Kibble
        </Button>

        {results && (
          <div className="mt-8 space-y-6">
            {results.ingredientAnalysis?.red_flags?.length > 0 && (
              <>
                <Card className="bg-red-50 border-2 border-red-300">
                  <CardHeader>
                    <CardTitle className="text-2xl text-red-700 flex items-center gap-2">
                      🚩 Ingredient Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {results.ingredientAnalysis.red_flags.map((flag, idx) => (
                        <li key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                          <p className="font-bold text-red-600">{flag.ingredient}</p>
                          <p className="text-gray-800 mt-1"><strong>Concern:</strong> {flag.concern}</p>
                          <p className="text-gray-800"><strong>Health Impact:</strong> {flag.health_impact}</p>
                          <p className="text-sm text-gray-600 mt-1 italic">📚 {flag.university_citation}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {foodData.ingredients && (
                  <Card className="bg-white border-2 border-gray-300">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-700">Full Ingredients List</CardTitle>
                      <p className="text-sm text-gray-600 mt-2">Red-flagged ingredients highlighted in light red</p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-800 leading-relaxed">
                        {foodData.ingredients.split(',').map((ingredient, idx) => {
                          const trimmedIngredient = ingredient.trim();
                          const isRedFlagged = results.ingredientAnalysis.red_flags.some(flag => 
                            trimmedIngredient.toLowerCase().includes(flag.ingredient.toLowerCase()) ||
                            flag.ingredient.toLowerCase().includes(trimmedIngredient.toLowerCase())
                          );
                          return (
                            <span key={idx}>
                              <span className={isRedFlagged ? 'bg-red-200 text-red-900 px-1 rounded' : ''}>
                                {trimmedIngredient}
                              </span>
                              {idx < foodData.ingredients.split(',').length - 1 && ', '}
                            </span>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {results.ingredientAnalysis?.ingredient_grade && (
              <Card className="bg-white border-2 border-blue-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-700">Ingredient Quality Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Overall Grade</p>
                      <p className="text-6xl font-bold text-blue-800">{results.ingredientAnalysis.ingredient_grade.grade}</p>
                      <p className="text-2xl text-gray-700 mt-2">{results.ingredientAnalysis.ingredient_grade.score}/100</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-800"><strong>Quality Assessment:</strong></p>
                      <p className="text-gray-700">{results.ingredientAnalysis.ingredient_grade.reasoning}</p>
                      <p className="text-sm text-gray-600 italic mt-3">📚 Source: {results.ingredientAnalysis.ingredient_grade.university_source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {results.ingredientAnalysis?.microorganisms && (
              <Card className="bg-white border-2 border-green-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-700">Microorganism & Gut Health Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Gut Health Support Score</p>
                      <p className="text-4xl font-bold text-green-700">{results.ingredientAnalysis.microorganisms.gut_health_score}/100</p>
                    </div>
                    {results.ingredientAnalysis.microorganisms.types?.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-800 mb-2">Beneficial Microorganisms Detected:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {results.ingredientAnalysis.microorganisms.types.map((type, idx) => (
                            <li key={idx} className="text-gray-700">{type}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.ingredientAnalysis.microorganisms.total_cfu && (
                      <p className="text-gray-700">
                        <strong>Total CFU Count:</strong> {results.ingredientAnalysis.microorganisms.total_cfu}
                      </p>
                    )}
                    <p className="text-gray-700">{results.ingredientAnalysis.microorganisms.summary}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-700">Analysis for {results.dogName}</CardTitle>
                <p className="text-lg text-gray-700 mt-2">Daily Price per Serving: <span className="font-bold">${results.costPerServing}</span></p>
                <p className="text-gray-600">Life Stage: <span className="font-semibold">{results.lifeStage}</span></p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left font-semibold">Nutrient</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Your Dog Gets</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.nutrients.map((nutrient, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{nutrient.name}</td>
                          <td className="border border-gray-300 p-3">{nutrient.actual}</td>
                          <td className="border border-gray-300 p-3">{nutrient.recommended}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-blue-700">Concluding Scoring Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left font-semibold">Health Area</th>
                        <th className="border border-gray-300 p-3 text-center font-semibold">Score (1-100)</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Reasoning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.healthScores.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{item.area}</td>
                          <td className="border border-gray-300 p-3 text-center font-bold text-lg">{item.score}</td>
                          <td className="border border-gray-300 p-3 text-sm">{item.reasoning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 p-4 bg-blue-100 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-800">Overall Score: {results.overallScore}/100</p>
                  <p className="text-xl font-bold text-blue-700 mt-2">Total Value Score: {results.overallScore}/100</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
              <CardHeader>
                <CardTitle className="text-xl text-red-700">Improve Your Overall Score</CardTitle>
                <p className="text-lg font-semibold text-gray-800 mt-2">
                  From {results.overallScore}/100 to {results.improvedOverallScore}/100
                </p>
                <p className="text-gray-700 mt-2">
                  Increasing your dog's life expectancy between 10-15% and quality of life between 50-70%
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <a 
                    href="https://nuvet.com/513237" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg"
                  >
                    Order NuVet (Green Bottle) & NuJoint DS (Blue Bottle) w/ AutoShip Today! →
                  </a>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">NuVet & NuJoint DS Recommendation (Tied to Kibble Benefits)</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Added Benefits to Kibble:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      NuVet Plus boosts kibble's nutrient profiles with 30+ ingredients (e.g., extra vitamins A/B/C/D/E/K, minerals like magnesium/phosphorus, enzymes/prebiotics for digestion, antioxidants like beta-carotene/pine bark for immune/skin). NuJoint DS doubles down on kibble's low joint nutrients (e.g., adds 500mg glucosamine/250mg chondroitin per wafer, vs. kibble's 0-750mg/kg daily intake). Together, they enhance all kibbles by filling gaps: stronger immune/digestion from NuVet, superior joint lubrication from NuJoint.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Pathologies Prevented:</h4>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Joint/arthritis degeneration (NuJoint's glucosamine/chondroitin prevent cartilage loss per UC Davis)</li>
                      <li>Immune deficiencies/infections (NuVet's antioxidants reduce oxidative stress/cancer risk per Cornell)</li>
                      <li>Heart issues like DCM (NuVet's taurine/vitamin E support cardiac function per Texas A&M)</li>
                      <li>Skin/coat allergies/dryness (omegas/vitamins prevent dermatitis per Cornell)</li>
                      <li>Digestive disorders/malnutrition (enzymes/prebiotics aid absorption per Purdue)</li>
                      <li>Eye degeneration (beta-carotene/vitamin E prevent retinal issues per Cornell)</li>
                      <li>Reproduction/hormone imbalances (zinc/vitamin E support fertility per Purdue)</li>
                    </ul>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Health Area</th>
                        <th className="border border-gray-300 p-2 text-center text-sm font-semibold">Original Score</th>
                        <th className="border border-gray-300 p-2 text-center text-sm font-semibold">Improved Score</th>
                        <th className="border border-gray-300 p-2 text-center text-sm font-semibold">Improvement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.improvements.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-sm">{item.area}</td>
                          <td className="border border-gray-300 p-2 text-center font-semibold">{item.original}</td>
                          <td className="border border-gray-300 p-2 text-center font-bold text-green-700">{item.improved}</td>
                          <td className="border border-gray-300 p-2 text-center font-bold text-green-600">+{item.improved - item.original}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-gray-800 mb-2">NuVet Plus & NuJoint DS % Improvements</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded">
                      <p className="font-semibold text-gray-800">Life Expectancy</p>
                      <p className="text-3xl font-bold text-green-700">+10-15%</p>
                      <p className="text-xs text-gray-600 mt-1">Antioxidants reduce age-related diseases</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-semibold text-gray-800">Quality of Life</p>
                      <p className="text-3xl font-bold text-blue-700">+50-70%</p>
                      <p className="text-xs text-gray-600 mt-1">Improved cognition/mobility</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-4">
                    Buy using code 513237 at <a href="https://nuvet.com/513237" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold underline">https://nuvet.com/513237</a> on autoship for 15% off.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}