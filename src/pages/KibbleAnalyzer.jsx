import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Camera, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingNutrition, setAnalyzingNutrition] = useState(false);
  const [analyzingIngredients, setAnalyzingIngredients] = useState(false);
  const [analyzingPrice, setAnalyzingPrice] = useState(false);
  const [selectedKibble, setSelectedKibble] = useState('new');
  const [showCustomInput, setShowCustomInput] = useState(true);

  const queryClient = useQueryClient();

  const { data: kibbles = [] } = useQuery({
    queryKey: ['kibbles'],
    queryFn: () => base44.entities.Kibble.list(),
  });

  const deleteKibbleMutation = useMutation({
    mutationFn: (id) => base44.entities.Kibble.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kibbles'] });
    },
  });

  const saveKibbleMutation = useMutation({
    mutationFn: (name) => base44.entities.Kibble.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kibbles'] });
    },
  });

  useEffect(() => {
    if (selectedKibble === 'new') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      const selected = kibbles.find(k => k.id === selectedKibble);
      if (selected) {
        handleFoodChange('dogFood', selected.name);
      }
    }
  }, [selectedKibble, kibbles]);

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
        prompt: `You are analyzing a dog food nutritional label image. Extract ALL visible nutritional information.

        CRITICAL INSTRUCTIONS:
        - Extract EVERY numerical value you can see, even if partially visible
        - Look at ALL sections: Guaranteed Analysis, Calorie Content, Feeding Guide, ingredient panel, and any small print
        - For feeding recommendations: look for feeding charts/tables (often shows weight ranges and cup amounts)
        - Return the actual numbers you see - DO NOT return null unless the value is truly not visible anywhere
        
        FIELDS TO EXTRACT:
        1. Product name and brand (dogFood)
        2. Recommended Feeding (cups/day) - check feeding guide/chart for the cup amount
        3. Calorie Content (kcal/kg) - often listed as "3500 kcal/kg" or "ME kcal/kg"
        4. Calorie Content (kcal/cup) - often listed as "350 kcal/cup" or near feeding guide
        5. Omega-3 (%) - minimum guarantee
        6. Omega-6 (%) - minimum guarantee  
        7. Vitamin E (IU/kg)
        8. Selenium (mg/kg)
        9. Zinc (mg/kg)
        10. Crude Protein (%) - guaranteed analysis
        11. Crude Fat (%) - guaranteed analysis
        12. Crude Fiber (%) - maximum guarantee
        13. Moisture (%) - maximum guarantee
        14. Taurine (%) - if listed
        15. Glucosamine (mg/kg) - if listed
        16. Chondroitin (mg/kg) - if listed
        
        Extract only numbers. If truly not visible, use null.`,
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

      console.log('Extracted nutrition data:', result);
      
      const updates = {};
      if (result.dogFood) updates.dogFood = result.dogFood;
      if (result.recommendedFeeding != null) updates.recommendedFeeding = result.recommendedFeeding.toString();
      if (result.kcalKg != null) updates.kcalKg = result.kcalKg.toString();
      if (result.kcalCup != null) updates.kcalCup = result.kcalCup.toString();
      if (result.omega3 != null) updates.omega3 = result.omega3.toString();
      if (result.omega6 != null) updates.omega6 = result.omega6.toString();
      if (result.vitaminE != null) updates.vitaminE = result.vitaminE.toString();
      if (result.selenium != null) updates.selenium = result.selenium.toString();
      if (result.zinc != null) updates.zinc = result.zinc.toString();
      if (result.crudeProtein != null) updates.crudeProtein = result.crudeProtein.toString();
      if (result.crudeFat != null) updates.crudeFat = result.crudeFat.toString();
      if (result.crudeFiber != null) updates.crudeFiber = result.crudeFiber.toString();
      if (result.moisture != null) updates.moisture = result.moisture.toString();
      if (result.taurine != null) updates.taurine = result.taurine.toString();
      if (result.glucosamine != null) updates.glucosamine = result.glucosamine.toString();
      if (result.chondroitin != null) updates.chondroitin = result.chondroitin.toString();

      setFoodData(prev => ({ ...prev, ...updates }));

      const extractedCount = Object.keys(updates).length;
      alert(`Nutritional data extracted! Found ${extractedCount} fields. Please review and adjust any values as needed.`);
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
        prompt: `Extract the complete ingredients list from this dog food label image. 

        INSTRUCTIONS:
        - Read ALL ingredients in the exact order they appear
        - Return as comma-separated text
        - Include everything from first ingredient to last
        - Preserve exact spelling and order
        
        Return the full ingredients list as one string.`,
        file_urls: [file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            ingredients: { type: "string" }
          }
        }
      });

      console.log('Extracted ingredients:', result);
      
      if (result.ingredients) {
        setFoodData(prev => ({ ...prev, ingredients: result.ingredients }));
        alert(`Ingredients extracted! Found ${result.ingredients.split(',').length} ingredients. Please review and adjust if needed.`);
      } else {
        alert('No ingredients found in image. Please try a clearer photo or enter manually.');
      }
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
        prompt: `Extract pricing and bag size from this image.

        LOOK FOR:
        - Price: any $ amount, price tag, MSRP, retail price
        - Bag size/weight: look for "lb", "lbs", "kg", or weight indication
        
        Return the numerical values you find. If not visible, return null.`,
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

      console.log('Extracted price data:', result);
      
      const updates = {};
      if (result.priceBag != null) updates.priceBag = result.priceBag.toString();
      if (result.bagWeight != null) updates.bagWeight = result.bagWeight.toString();
      
      setFoodData(prev => ({ ...prev, ...updates }));
      
      const extractedCount = Object.keys(updates).length;
      if (extractedCount > 0) {
        alert(`Extracted ${extractedCount} field(s)! Please review and adjust if needed.`);
      } else {
        alert('No price or weight data found. Please try a clearer photo or enter manually.');
      }
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
    
    // Calculate daily nutrient intake
    // Research-based formula: cups × grams per cup = total grams consumed per day
    const gramsPerCup = 115; // AAFCO standard cup weight for dry kibble
    const dailyFoodGrams = cupsNeeded * gramsPerCup;

    // Omega-3 and Omega-6 Fatty Acid Calculations (AAFCO/NRC Standards)
    // Food labels list omegas as minimum percentage of total food weight
    // Formula: (percentage / 100) × grams consumed = grams of fatty acid
    // Convert to mg for omega-3 (multiply by 1000) and keep g for omega-6

    const omega3Percentage = parseFloat(foodData.omega3) || 0;
    const omega6Percentage = parseFloat(foodData.omega6) || 0;

    // Omega-3: Convert percentage to mg/day
    // (% / 100) × grams food × 1000 = mg
    const dailyOmega3 = Math.round((omega3Percentage / 100) * dailyFoodGrams * 1000); // mg/day

    // Omega-6: Convert percentage to g/day  
    // (% / 100) × grams food = g
    const dailyOmega6 = ((omega6Percentage / 100) * dailyFoodGrams).toFixed(1); // g/day

    // For nutrients listed as concentration per kg of food (IU/kg or mg/kg)
    // Formula: (concentration per kg) × (kg food consumed) = daily amount
    const dailyFoodKg = dailyFoodGrams / 1000;

    const dailyVitaminE = Math.round((parseFloat(foodData.vitaminE) || 0) * dailyFoodKg); // IU/day
    const dailySelenium = ((parseFloat(foodData.selenium) || 0) * dailyFoodKg).toFixed(3); // mg/day
    const dailyZinc = Math.round((parseFloat(foodData.zinc) || 0) * dailyFoodKg); // mg/day
    const dailyGlucosamine = Math.round((parseFloat(foodData.glucosamine) || 0) * dailyFoodKg); // mg/day
    const dailyChondroitin = Math.round((parseFloat(foodData.chondroitin) || 0) * dailyFoodKg); // mg/day

    // Taurine (listed as percentage): convert to mg/day
    // (% / 100) × grams food × 1000 = mg
    const dailyTaurine = Math.round((parseFloat(foodData.taurine) || 0) / 100 * dailyFoodGrams * 1000); // mg/day

    // Get weather and seasonal data for zipcode
    let weatherData = null;
    let seasonalAllergies = null;
    if (dogData.zipCode) {
      try {
        weatherData = await base44.integrations.Core.InvokeLLM({
          prompt: `Look up current weather and climate information for zipcode ${dogData.zipCode}. 

          Provide:
          1. Current temperature and conditions
          2. Current season and typical weather patterns
          3. Climate characteristics of this region

          Return structured data.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              current_temp: { type: "string" },
              conditions: { type: "string" },
              season: { type: "string" },
              climate_type: { type: "string" }
            }
          }
        });

        seasonalAllergies = await base44.integrations.Core.InvokeLLM({
          prompt: `Based on current date (January 2026) and location zipcode ${dogData.zipCode}, research:

          1. Common dog allergies during this season in this region
          2. Environmental allergens affecting dogs right now
          3. Credible veterinary sources (Cornell, UC Davis, Tufts, etc.) recommendations for dog nutrition during this season
          4. How weather and season affect dog dietary needs

          IMPORTANT: Do NOT include garlic in the ingredients to avoid list.

          Return detailed information with university citations.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              seasonal_allergens: { type: "array", items: { type: "string" } },
              common_symptoms: { type: "array", items: { type: "string" } },
              dietary_recommendations: { type: "string" },
              ingredient_recommendations: { type: "array", items: { type: "string" } },
              ingredients_to_avoid: { type: "array", items: { type: "string" } },
              university_citations: { type: "array", items: { type: "string" } }
            }
          }
        });
      } catch (error) {
        console.error('Weather/seasonal analysis error:', error);
      }
    }

    // Analyze ingredients with AI (using credible university sources)
    let ingredientAnalysis = null;
    if (foodData.ingredients) {
      try {
        const seasonalContext = weatherData && seasonalAllergies ? 
          `\n\nSEASONAL CONTEXT: Current season is ${weatherData.season}, climate: ${weatherData.climate_type}. Seasonal allergens in this region: ${seasonalAllergies.seasonal_allergens?.join(', ')}. Consider these factors when analyzing ingredients.` : '';

        ingredientAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze these dog food ingredients for a ${weight} lb dog: "${foodData.ingredients}".${seasonalContext}

          Provide analysis based on credible university veterinary studies (Cornell, UC Davis, Tufts, Purdue, Texas A&M, Ohio State):

          1. Microorganisms: Identify any probiotics/prebiotics (e.g., Lactobacillus, Bacillus, chicory root, dried fermentation products). Estimate total CFU count if probiotics are listed, and list specific strains. Rate gut microbiome support (1-100).

          2. Ingredient Quality Analysis:
          Research EACH individual ingredient through credible university veterinary sources (Cornell, UC Davis, Tufts, Purdue, Texas A&M, Ohio State).

          CRITICAL RULE: Any protein source with the word "meal" after it (e.g., chicken meal, fish meal, beef meal) should score NO HIGHER than +2, regardless of quality.

          For EVERY ingredient in the list, provide:
          - Ingredient name
          - Score from -5 to 5 where:
           * -5: Horribly bad for dogs (toxic, dangerous, linked to serious health issues)
           * -4 to -3: Very poor quality (known allergens, fillers with no nutritional value, controversial additives)
           * -2 to -1: Low quality (by-products, low-grade proteins, questionable ingredients)
           * 0: Neutral (neither beneficial nor harmful)
           * 1 to 2: Decent quality (provides some nutrition, generally safe) - MEALS MAX OUT AT +2
           * 3 to 4: Good quality (beneficial nutrients, good protein sources, healthy additions)
           * 5: Excellent for dogs (premium proteins, superfoods, proven health benefits)
          - Brief reasoning with university citation

          Then calculate:
          - Total score (sum of all ingredient scores)
          - Average score per ingredient
          - Count of positive vs negative ingredients
          - Overall grade: EXCELLENT (avg ≥3), GOOD (avg ≥2), AVERAGE (avg ≥0), POOR (avg <0)

          3. Red Flags: Identify problematic ingredients with specific university study citations. Include: artificial colors/preservatives (BHA, BHT, ethoxyquin), controversial grains, low-quality proteins, excessive fillers, allergens.

          Return structured data with university citations and detailed scoring breakdown.`,
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
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        score: { type: "number" },
                        reasoning: { type: "string" },
                        citation: { type: "string" }
                      }
                    }
                  },
                  total_score: { type: "number" },
                  average_score: { type: "number" },
                  positive_count: { type: "number" },
                  negative_count: { type: "number" },
                  grade: { type: "string", enum: ["EXCELLENT", "GOOD", "AVERAGE", "POOR"] }
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
      weatherData: weatherData,
      seasonalAllergies: seasonalAllergies,
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

    // Save kibble name to database if it's new
    if (foodData.dogFood && !kibbles.find(k => k.name === foodData.dogFood)) {
      saveKibbleMutation.mutate(foodData.dogFood);
    }

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
                  <div className="space-y-2">
                    <Select value={selectedKibble} onValueChange={setSelectedKibble}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select previous kibble or enter new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">➕ Enter New Kibble</SelectItem>
                        {kibbles.map((kibble) => (
                          <SelectItem key={kibble.id} value={kibble.id}>
                            {kibble.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showCustomInput && (
                      <Input
                        placeholder="e.g., 4health Salmon & Potato"
                        value={foodData.dogFood}
                        onChange={(e) => handleFoodChange('dogFood', e.target.value)}
                      />
                    )}
                    {kibbles.length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Manage saved kibbles ({kibbles.length})
                        </summary>
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                          {kibbles.map((kibble) => (
                            <div key={kibble.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-gray-700 text-sm">{kibble.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm(`Delete "${kibble.name}"?`)) {
                                    deleteKibbleMutation.mutate(kibble.id);
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
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
            {results.weatherData && results.seasonalAllergies && (
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-700">🌤️ Location & Seasonal Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg">
                      <p className="font-semibold text-gray-800 mb-2">Current Weather</p>
                      <p className="text-gray-700"><strong>Temperature:</strong> {results.weatherData.current_temp}</p>
                      <p className="text-gray-700"><strong>Conditions:</strong> {results.weatherData.conditions}</p>
                      <p className="text-gray-700"><strong>Season:</strong> {results.weatherData.season}</p>
                      <p className="text-gray-700"><strong>Climate:</strong> {results.weatherData.climate_type}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg">
                      <p className="font-semibold text-gray-800 mb-2">Seasonal Allergens</p>
                      {results.seasonalAllergies.seasonal_allergens?.length > 0 && (
                        <ul className="list-disc list-inside space-y-1">
                          {results.seasonalAllergies.seasonal_allergens.map((allergen, idx) => (
                            <li key={idx} className="text-gray-700 text-sm">{allergen}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-gray-800 mb-2">Common Allergy Symptoms This Season</p>
                    {results.seasonalAllergies.common_symptoms?.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 mb-3">
                        {results.seasonalAllergies.common_symptoms.map((symptom, idx) => (
                          <li key={idx} className="text-gray-700 text-sm">{symptom}</li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm text-gray-700">
                      If your dog has these symptoms make sure to watch this playlist:{' '}
                      <a 
                        href="https://youtube.com/playlist?list=PLbQ5YaICgTRIHo9bIcXEKU98np4epAVF8&si=Zl_aEB7BG-bQQOsn" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Watch Here
                      </a>
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold text-gray-800 mb-3">Dietary Recommendations for This Season</p>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">{results.seasonalAllergies.dietary_recommendations}</p>

                    {results.seasonalAllergies.ingredient_recommendations?.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-green-700 text-sm mb-1">Recommended Ingredients:</p>
                        <p className="text-gray-700 text-sm">{results.seasonalAllergies.ingredient_recommendations.join(', ')}</p>
                      </div>
                    )}

                    {results.seasonalAllergies.ingredients_to_avoid?.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-red-700 text-sm mb-1">Ingredients to Avoid:</p>
                        <p className="text-gray-700 text-sm">{results.seasonalAllergies.ingredients_to_avoid.join(', ')}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-green-300">
                      <p className="font-semibold text-green-800 text-sm mb-2">
                        Raw and Cooked Diets are Best Against Allergies
                      </p>
                      <p className="text-gray-700 text-sm mb-4">
                        Make Sure To Watch This Playlist With Recipes:{' '}
                        <a 
                          href="https://youtube.com/playlist?list=PLbQ5YaICgTRII52jk3XKqC0nlmAk6i6ra&si=EYhkYIP-mEG-gPLg" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          Watch Here
                        </a>
                      </p>

                      <div className="mt-4 pt-3 border-t border-green-300">
                        <p className="font-semibold text-gray-800 text-sm mb-2">
                          Best Kibble Option For Your Dog's Allergies And Dog Food Goal You Selected Earlier. Based On The Kibbles You Have Entered Is:
                        </p>
                        <p className="text-gray-700 text-sm mb-2">
                          {foodData.dogFood || 'Current kibble'}
                        </p>
                        <p className="text-red-600 text-sm font-semibold">
                          The more kibble brands you enter the better recommendations we can give you.
                        </p>
                      </div>
                    </div>
                    </div>

                  {results.seasonalAllergies.university_citations?.length > 0 && (
                    <div className="pt-3 border-t border-blue-200">
                      <p className="font-semibold text-gray-800 text-sm mb-2">📚 Credible Sources:</p>
                      <ul className="space-y-1">
                        {results.seasonalAllergies.university_citations.map((citation, idx) => (
                          <li key={idx} className="text-xs text-gray-600 italic">{citation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                      <p className="text-sm text-gray-600 mt-2">Red-flagged ingredients shown in red</p>
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
                              <span className={isRedFlagged ? 'text-red-600 font-semibold' : ''}>
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
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-4 text-center">Overall Grade</p>
                      
                      <div className="relative h-12 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full overflow-hidden">
                        <div className={`absolute top-0 h-full w-1 bg-gray-900 shadow-lg transition-all ${
                          results.ingredientAnalysis.ingredient_grade.grade === 'EXCELLENT' ? 'left-[90%]' :
                          results.ingredientAnalysis.ingredient_grade.grade === 'GOOD' ? 'left-[70%]' :
                          results.ingredientAnalysis.ingredient_grade.grade === 'AVERAGE' ? 'left-[50%]' :
                          'left-[20%]'
                        }`}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold">
                              {results.ingredientAnalysis.ingredient_grade.grade}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-2 text-xs font-semibold">
                        <span className="text-red-700">POOR</span>
                        <span className="text-yellow-700">AVERAGE</span>
                        <span className="text-green-700">EXCELLENT</span>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white rounded-lg text-sm space-y-1">
                        <p><strong>Total Score:</strong> {results.ingredientAnalysis.ingredient_grade.total_score}</p>
                        <p><strong>Average Score per Ingredient:</strong> {results.ingredientAnalysis.ingredient_grade.average_score?.toFixed(2)}</p>
                        <p><strong>Positive Ingredients:</strong> {results.ingredientAnalysis.ingredient_grade.positive_count} | <strong>Negative:</strong> {results.ingredientAnalysis.ingredient_grade.negative_count}</p>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                      <p className="font-semibold text-gray-800 text-lg sticky top-0 bg-gray-50 pb-2">Individual Ingredient Scores (-5 to 5):</p>
                      {results.ingredientAnalysis.ingredient_grade.ingredients?.map((ingredient, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                          ingredient.score >= 4 ? 'bg-green-50 border-green-500' :
                          ingredient.score >= 2 ? 'bg-blue-50 border-blue-500' :
                          ingredient.score >= 0 ? 'bg-yellow-50 border-yellow-500' :
                          ingredient.score >= -2 ? 'bg-orange-50 border-orange-500' :
                          'bg-red-50 border-red-500'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-gray-800">{ingredient.name}</p>
                            <span className={`text-lg font-bold px-2 py-0.5 rounded ${
                              ingredient.score >= 4 ? 'text-green-700 bg-green-100' :
                              ingredient.score >= 2 ? 'text-blue-700 bg-blue-100' :
                              ingredient.score >= 0 ? 'text-yellow-700 bg-yellow-100' :
                              ingredient.score >= -2 ? 'text-orange-700 bg-orange-100' :
                              'text-red-700 bg-red-100'
                            }`}>
                              {ingredient.score > 0 ? '+' : ''}{ingredient.score}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{ingredient.reasoning}</p>
                          <p className="text-xs text-gray-600 italic">📚 {ingredient.citation}</p>
                        </div>
                      ))}
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
                          {results.ingredientAnalysis.microorganisms.types.slice(0, 3).map((type, idx) => (
                            <li key={idx} className="text-gray-700">{type}</li>
                          ))}
                        </ul>
                        {results.ingredientAnalysis.microorganisms.types.length > 3 && (
                          <details className="mt-2">
                            <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                              Show {results.ingredientAnalysis.microorganisms.types.length - 3} more...
                            </summary>
                            <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                              {results.ingredientAnalysis.microorganisms.types.slice(3).map((type, idx) => (
                                <li key={idx + 3} className="text-gray-700">{type}</li>
                              ))}
                            </ul>
                          </details>
                        )}
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
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962f30dcbc8ea78316c894a/1da1f7118_FF97F53B-72C0-4E5E-9DB9-3F5DEFBF447F.png"
                      alt="Order NuVet"
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
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