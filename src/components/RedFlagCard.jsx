import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HARDCODED_FLAGS = [
  {
    match: 'garbanzo',
    name: '⚠️ Garbanzo Beans — Linked to Heart Disease',
    concern: 'Legume linked to Dilated Cardiomyopathy (DCM)',
    impact: "FDA's 2019 investigation found garbanzo beans (chickpeas) among the most common ingredients in diets associated with DCM in dogs. High legume content may interfere with taurine metabolism, weakening heart muscle function over time.",
    heartWarning: true,
    citation: 'UC Davis School of Veterinary Medicine, 2018 — "UC Davis Investigates Link Between Dog Diets and Deadly Heart Disease" (reports of DCM in dogs eating peas, lentils, legume seeds as main ingredients). | Tufts University Cummings School of Veterinary Medicine, 2023 — "Diet-associated DCM: The cause is not yet known but it hasn\'t gone away." | Ontiveros et al., 2019 — Journal of Animal Science (Oxford/PMC6396252): Association between pulse ingredients and canine DCM.',
  },
  {
    match: 'pea',
    name: '⚠️ Peas — Linked to Heart Disease',
    concern: 'Legume filler linked to Dilated Cardiomyopathy (DCM)',
    impact: "Peas were the #1 most frequently reported ingredient in FDA-investigated DCM cases. Research from Tufts University suggests peas may be most associated with this form of DCM. Legumes like peas may reduce taurine bioavailability and disrupt cardiac function, especially when listed in the top 5 ingredients.",
    heartWarning: true,
    citation: 'Tufts University Cummings School of Veterinary Medicine, 2023 — "Diet-associated DCM: The cause is not yet known but it hasn\'t gone away" (notes peas most associated with DCM). | UC Davis School of Veterinary Medicine, 2018 — Investigation into DCM linked to legume-heavy diets. | Ontiveros et al., 2019 — Journal of Animal Science (Oxford/PMC6396252): "The association between pulse ingredients and canine dilated cardiomyopathy."',
  },
  {
    match: 'lentil',
    name: '⚠️ Lentils — Linked to Heart Disease',
    concern: 'Legume filler linked to Dilated Cardiomyopathy (DCM)',
    impact: "Lentils were among the top ingredients flagged in the FDA's DCM investigation. Like other legumes, lentils may impair taurine synthesis and absorption, contributing to weakened heart muscle and reduced cardiac output in dogs.",
    heartWarning: true,
    citation: 'UC Davis School of Veterinary Medicine, 2018 — "UC Davis Investigates Link Between Dog Diets and Deadly Heart Disease" (lentils listed as flagged ingredient). | Ontiveros et al., 2019 — Journal of Animal Science (Oxford/PMC6396252): "The association between pulse ingredients and canine dilated cardiomyopathy." | FDA CVM, 2019 — Investigation into Potential Link Between Certain Diets and Canine DCM.',
  },
  {
    match: 'powdered cellulose',
    name: 'Powdered Cellulose',
    concern: 'Low-quality wood pulp filler',
    impact: 'Provides zero nutritional value; used as a cheap bulk filler that dilutes nutrient density in dog food.',
    heartWarning: false,
    citation: 'Carciofi et al., 2008 — Journal of Animal Physiology and Animal Nutrition: Cellulose provides no digestible nutrients for dogs.',
  },
];

export default function RedFlagCard({ ingredients, aiRedFlags }) {
  const lowerIng = ingredients.toLowerCase();

  const hardcodedMatches = HARDCODED_FLAGS.filter(f => lowerIng.includes(f.match));

  // AI flags that aren't already covered by hardcoded ones
  const aiOnlyFlags = aiRedFlags.filter(f => {
    const name = f.ingredient.toLowerCase();
    return !HARDCODED_FLAGS.some(h => name.includes(h.match) || h.match.includes(name));
  });

  if (hardcodedMatches.length === 0 && aiOnlyFlags.length === 0) return null;

  return (
    <Card className="bg-red-50 border-2 border-red-300">
      <CardHeader>
        <CardTitle className="text-2xl text-red-700 flex items-center gap-2">
          🚩 Ingredient Red Flags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {hardcodedMatches.map((flag, idx) => (
            <li key={idx} className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-bold text-red-600">{flag.name}</p>
              <p className="text-gray-800 mt-1"><strong>Concern:</strong> {flag.concern}</p>
              <p className="text-gray-800"><strong>Health Impact:</strong> {flag.impact}</p>
              {flag.heartWarning && (
                <p className="text-red-700 font-bold mt-2">
                  🫐 ⚠️ This pattern has been linked to heart issues (Dilated Cardiomyopathy / DCM) in dogs by the FDA and multiple university veterinary schools.
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1 italic">📚 {flag.citation}</p>
            </li>
          ))}
          {aiOnlyFlags.map((flag, idx) => (
            <li key={`ai-${idx}`} className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-bold text-red-600">{flag.ingredient}</p>
              <p className="text-gray-800 mt-1"><strong>Concern:</strong> {flag.concern}</p>
              <p className="text-gray-800"><strong>Health Impact:</strong> {flag.health_impact}</p>
              <p className="text-sm text-gray-600 mt-1 italic">📚 {flag.university_citation}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}