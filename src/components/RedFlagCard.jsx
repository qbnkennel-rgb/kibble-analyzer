import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HARDCODED_FLAGS = [
  {
    match: 'garbanzo',
    name: '⚠️ Garbanzo Beans — Linked to Canine Heart Disease (DCM)',
    concern: 'Legume ingredient associated with Dilated Cardiomyopathy (DCM) in dogs',
    impact: "The FDA's 2019 investigation identified garbanzo beans (chickpeas) as a commonly reported ingredient in diets associated with DCM. Legumes like chickpeas may interfere with taurine metabolism, leading to weakened heart muscle over time.",
    heartWarning: true,
    citation: 'UC Davis School of Veterinary Medicine (2018): "UC Davis Investigates Link Between Dog Diets and Deadly Heart Disease" — reports of DCM in dogs eating legume-heavy diets. | Ontiveros et al. (2019), Journal of Animal Science, Vol. 97(3):983–995 (Oxford Academic / PMC6396252): "The association between pulse ingredients and canine dilated cardiomyopathy." | FDA CVM (2019): Investigation into Potential Link Between Certain Diets and Canine DCM.',
  },
  {
    match: 'pea',
    name: '⚠️ Peas — Linked to Canine Heart Disease (DCM)',
    concern: 'Legume filler associated with Dilated Cardiomyopathy (DCM) in dogs',
    impact: "Peas were the single most frequently reported ingredient in FDA-investigated DCM cases. Tufts University Cummings School of Veterinary Medicine specifically noted that peas appear most associated with diet-related DCM. Peas may reduce taurine bioavailability, disrupting cardiac function especially when listed in the top ingredients.",
    heartWarning: true,
    citation: 'Tufts University Cummings School of Veterinary Medicine (2023): "Diet-associated dilated cardiomyopathy: The cause is not yet known but it hasn\'t gone away" — specifically notes peas as the ingredient most associated with DCM. | UC Davis School of Veterinary Medicine (2018): "UC Davis Investigates Link Between Dog Diets and Deadly Heart Disease." | Ontiveros et al. (2019), Journal of Animal Science, Vol. 97(3):983–995 (Oxford Academic / PMC6396252): "The association between pulse ingredients and canine dilated cardiomyopathy."',
  },
  {
    match: 'lentil',
    name: '⚠️ Lentils — Linked to Canine Heart Disease (DCM)',
    concern: 'Legume filler associated with Dilated Cardiomyopathy (DCM) in dogs',
    impact: "Lentils were among the top ingredients flagged in the FDA's DCM investigation. Like other pulse legumes, lentils may impair taurine synthesis and absorption, contributing to weakened heart muscle and reduced cardiac output.",
    heartWarning: true,
    citation: 'Ontiveros et al. (2019), Journal of Animal Science, Vol. 97(3):983–995 (Oxford Academic / PMC6396252): "The association between pulse ingredients and canine dilated cardiomyopathy." | UC Davis School of Veterinary Medicine (2018): "UC Davis Investigates Link Between Dog Diets and Deadly Heart Disease" — lentils listed as flagged pulse ingredient. | FDA CVM (2019): Investigation into Potential Link Between Certain Diets and Canine DCM.',
  },
  {
    match: 'powdered cellulose',
    name: '⚠️ Powdered Cellulose — Low-Quality Wood Pulp Filler',
    concern: 'Non-nutritive wood pulp filler that dilutes food quality',
    impact: 'Provides zero nutritional value; used as a cheap bulk filler that reduces overall nutrient density in dog food.',
    heartWarning: false,
    citation: 'Carciofi et al. (2008), Journal of Animal Physiology and Animal Nutrition: "Cellulose provides no digestible nutrients for dogs."',
  },
];

export default function RedFlagCard({ ingredients, aiRedFlags = [] }) {
  if (!ingredients) return null;

  const lowerIng = ingredients.toLowerCase();

  const matchesIngredient = (text, match) => {
    // Use word-boundary style: match must be preceded/followed by non-alpha
    const re = new RegExp(`(^|[^a-z])${match}([^a-z]|$)`);
    return re.test(text);
  };

  const hardcodedMatches = HARDCODED_FLAGS.filter(f => matchesIngredient(lowerIng, f.match));

  const aiOnlyFlags = aiRedFlags.filter(f => {
    const name = f.ingredient.toLowerCase();
    return !HARDCODED_FLAGS.some(h => matchesIngredient(name, h.match) || matchesIngredient(h.match, name.split(' ')[0]));
  });

  if (hardcodedMatches.length === 0 && aiOnlyFlags.length === 0) return null;

  return (
    <Card className="bg-red-50 border-2 border-red-400">
      <CardHeader>
        <CardTitle className="text-2xl text-red-700 flex items-center gap-2">
          🚩 Ingredient Red Flags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {hardcodedMatches.map((flag, idx) => (
            <li key={idx} className="border-l-4 border-red-500 pl-4 py-2 bg-white rounded-r-lg">
              <p className="font-bold text-red-700 text-lg">{flag.name}</p>
              <p className="text-gray-800 mt-1"><strong>Concern:</strong> {flag.concern}</p>
              <p className="text-gray-800 mt-1"><strong>Health Impact:</strong> {flag.impact}</p>
              {flag.heartWarning && (
                <p className="text-red-700 font-bold mt-2 p-2 bg-red-100 rounded">
                  🫀 ⚠️ This pattern has been linked to heart issues (Dilated Cardiomyopathy / DCM) in dogs by the FDA and multiple university veterinary schools.
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2 italic">📚 {flag.citation}</p>
            </li>
          ))}
          {aiOnlyFlags.map((flag, idx) => (
            <li key={`ai-${idx}`} className="border-l-4 border-orange-400 pl-4 py-2 bg-white rounded-r-lg">
              <p className="font-bold text-orange-700 text-lg">{flag.ingredient}</p>
              <p className="text-gray-800 mt-1"><strong>Concern:</strong> {flag.concern}</p>
              <p className="text-gray-800 mt-1"><strong>Health Impact:</strong> {flag.health_impact}</p>
              <p className="text-xs text-gray-600 mt-2 italic">📚 {flag.university_citation}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}