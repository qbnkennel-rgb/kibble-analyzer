import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

export default function AnalysisResults({ results, recallInfo, foodData }) {
  if (!results) return null;

  return (
    <div className="mt-8 space-y-6">
      {recallInfo?.has_recall && recallInfo.recalls?.length > 0 && (
        <Card className="bg-red-50 border-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-3xl text-red-700 flex items-center gap-3">
              ⚠️ FDA RECALL ALERT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-bold text-red-800">
              WARNING: This product or similar products have been recalled by the FDA!
            </p>
            {recallInfo.recalls.map((recall, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border-2 border-red-400">
                <p className="font-bold text-xl text-red-700">{recall.brand_name}</p>
                <p className="text-gray-800 mt-2"><strong>Product:</strong> {recall.product_description}</p>
                <p className="text-gray-800"><strong>Recall Date:</strong> {recall.recall_date}</p>
                <p className="text-gray-800"><strong>Reason:</strong> {recall.reason}</p>
                <p className="text-gray-800"><strong>Company:</strong> {recall.company}</p>
                {recall.severity && (
                  <p className="text-red-600 font-semibold mt-2">Severity: {recall.severity}</p>
                )}
                {recall.fda_link && (
                  <a href={recall.fda_link} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 mt-2 inline-block">
                    View FDA Recall Notice →
                  </a>
                )}
                {recall.terminated && (
                  <p className="text-sm text-gray-600 mt-2 italic">Note: This recall has been terminated by the FDA</p>
                )}
              </div>
            ))}
            <p className="text-sm text-gray-700 mt-4">
              If you have this product, stop feeding it immediately and consult your veterinarian.
              Visit{' '}
              <a href="https://www.fda.gov/animal-veterinary/safety-health/recalls-withdrawals"
                target="_blank" rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800">
                FDA Animal Recalls
              </a>
              {' '}for the latest information.
            </p>
          </CardContent>
        </Card>
      )}

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
                <a href="https://youtube.com/playlist?list=PLbQ5YaICgTRIHo9bIcXEKU98np4epAVF8&si=Zl_aEB7BG-bQQOsn"
                  target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={() => base44.analytics.track({ eventName: "allergy_symptoms_playlist_clicked" })}>
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
                <p className="font-semibold text-green-800 text-sm mb-2">Raw and Cooked Diets are Best Against Allergies</p>
                <p className="text-gray-700 text-sm mb-4">
                  Make Sure To Watch This Playlist With Recipes:{' '}
                  <a href="https://youtube.com/playlist?list=PLbQ5YaICgTRII52jk3XKqC0nlmAk6i6ra&si=EYhkYIP-mEG-gPLg"
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                    onClick={() => base44.analytics.track({ eventName: "recipe_playlist_clicked" })}>
                    Watch Here
                  </a>
                </p>
                <div className="mt-4 pt-3 border-t border-green-300">
                  <p className="font-semibold text-gray-800 text-sm mb-2">
                    Best Kibble Option For Your Dog's Allergies And Dog Food Goal You Selected Earlier. Based On The Kibbles You Have Entered Is:
                  </p>
                  <p className="text-gray-700 text-sm mb-2">{foodData.dogFood || 'Current kibble'}</p>
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

      {/* Red Flags Card - always show if any red flags OR powdered cellulose/legumes detected */}
      {(results.ingredientAnalysis?.red_flags?.length > 0 || (foodData.ingredients && /powdered cellulose|\bgarbanzo beans?\b|\bpeas?\b|\blentils?\b/i.test(foodData.ingredients))) && (
        <Card className="bg-red-50 border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-2xl text-red-700 flex items-center gap-2">
              🚩 Ingredient Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {/* Hardcoded powdered cellulose flag - always shown if detected */}
              {foodData.ingredients && /powdered cellulose/i.test(foodData.ingredients) && (
                <li className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-bold text-red-600">Powdered Cellulose</p>
                  <p className="text-gray-800 mt-1"><strong>Concern:</strong> Low-quality wood pulp filler</p>
                  <p className="text-gray-800"><strong>Health Impact:</strong> Provides zero nutritional value; used as a cheap bulk filler that dilutes nutrient density in dog food.</p>
                  <p className="text-sm text-gray-600 mt-1 italic">📚 Carciofi et al., 2008 - Journal of Animal Physiology and Animal Nutrition: Cellulose provides no digestible nutrients for dogs.</p>
                </li>
              )}
              {/* Hardcoded garbanzo beans flag */}
              {foodData.ingredients && /\bgarbanzo beans?\b/i.test(foodData.ingredients) && (
                <li className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-bold text-red-600">Garbanzo Beans</p>
                  <p className="text-gray-800 mt-1"><strong>Concern:</strong> High-glycemic legume linked to DCM risk</p>
                  <p className="text-gray-800"><strong>Health Impact:</strong> Associated with dilated cardiomyopathy (DCM) in dogs; FDA investigated legume-heavy grain-free diets.</p>
                  <p className="text-sm text-gray-600 mt-1 italic">📚 FDA, 2019 - Investigation into potential link between legume-heavy diets and DCM in dogs.</p>
                </li>
              )}
              {/* Hardcoded peas flag */}
              {foodData.ingredients && /\bpeas?\b/i.test(foodData.ingredients) && (
                <li className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-bold text-red-600">Peas</p>
                  <p className="text-gray-800 mt-1"><strong>Concern:</strong> Legume filler linked to DCM risk</p>
                  <p className="text-gray-800"><strong>Health Impact:</strong> Frequently used as cheap protein/starch filler; FDA flagged peas as a common ingredient in DCM-associated diets.</p>
                  <p className="text-sm text-gray-600 mt-1 italic">📚 FDA, 2019 - Investigation into potential link between legume-heavy diets and DCM in dogs.</p>
                </li>
              )}
              {/* Hardcoded lentils flag */}
              {foodData.ingredients && /\blentils?\b/i.test(foodData.ingredients) && (
                <li className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-bold text-red-600">Lentils</p>
                  <p className="text-gray-800 mt-1"><strong>Concern:</strong> Legume filler linked to DCM risk</p>
                  <p className="text-gray-800"><strong>Health Impact:</strong> Associated with DCM in dogs when used as a primary ingredient; acts as a cheap protein substitute.</p>
                  <p className="text-sm text-gray-600 mt-1 italic">📚 FDA, 2019 - Investigation into potential link between legume-heavy diets and DCM in dogs.</p>
                </li>
              )}
              {(results.ingredientAnalysis?.red_flags || []).filter(f => !/powdered cellulose|garbanzo beans|peas|lentils/i.test(f.ingredient)).map((flag, idx) => (
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
      )}

      {/* Full Ingredients List - always shown when ingredients exist */}
      {foodData.ingredients && (
        <Card className="bg-white border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-700">Full Ingredients List</CardTitle>
            <p className="text-sm text-gray-600 mt-2">Red-flagged ingredients shown in red</p>
          </CardHeader>
          <CardContent>
            <div className="text-gray-800 leading-relaxed">
              {foodData.ingredients.split(',').map((ingredient, idx) => {
                const trimmed = ingredient.trim();
                const redFlags = results.ingredientAnalysis?.red_flags || [];
                const gradedIngredients = results.ingredientAnalysis?.ingredient_grade?.ingredients || [];
                const KNOWN_ALLERGENS = /\b(wheat|corn|soy|soybean|gluten|dairy|milk|egg|eggs|beef|chicken|lamb|pork|fish|salmon|tuna|shrimp|barley|oat|oats|peanut|potato|sweet potato|lentil|lentils|pea|peas|legume|legumes|garbanzo beans?|lentils?)\b/i;
                const hasNegativeScore = gradedIngredients.some(g =>
                  g.score < 0 && (
                    trimmed.toLowerCase().includes(g.name.toLowerCase()) ||
                    g.name.toLowerCase().includes(trimmed.toLowerCase())
                  )
                );
                const isKnownAllergen = KNOWN_ALLERGENS.test(trimmed);
                const isRed = /powdered cellulose/i.test(trimmed) || hasNegativeScore || isKnownAllergen || redFlags.some(f =>
                  trimmed.toLowerCase().includes(f.ingredient.toLowerCase()) ||
                  f.ingredient.toLowerCase().includes(trimmed.toLowerCase())
                );
                return (
                  <span key={idx}>
                    <span className={isRed ? 'text-red-600 font-semibold' : ''}>{trimmed}</span>
                    {idx < foodData.ingredients.split(',').length - 1 && ', '}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
                <p className="text-gray-700"><strong>Total CFU Count:</strong> {results.ingredientAnalysis.microorganisms.total_cfu}</p>
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
          <div className="text-center space-y-4">
            <a href="https://nuvet.com/513237" target="_blank" rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
              onClick={() => base44.analytics.track({ eventName: "nuvet_image_clicked" })}>
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962f30dcbc8ea78316c894a/1da1f7118_FF97F53B-72C0-4E5E-9DB9-3F5DEFBF447F.png"
                alt="Order NuVet"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </a>
            <button
              onClick={() => {
                window.open('https://nuvet.com/513237', '_blank');
                base44.analytics.track({ eventName: "nuvet_order_button_clicked" });
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-lg py-3 px-8 rounded-md font-medium"
            >
              Click Here to Order
            </button>
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
              Buy using code 513237 at{' '}
              <a href="https://nuvet.com/513237" target="_blank" rel="noopener noreferrer"
                className="text-red-600 font-bold underline"
                onClick={() => base44.analytics.track({ eventName: "nuvet_text_link_clicked" })}>
                https://nuvet.com/513237
              </a>
              {' '}on autoship for 15% off.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}