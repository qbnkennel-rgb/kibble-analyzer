import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

function FoodItem({ item, size, sizeLabel }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-green-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-green-50 transition-colors"
      >
        <span className="font-semibold text-green-800">🌿 {item.food}</span>
        <div className="flex items-center gap-3 shrink-0">
          {size && item.dosage?.[size] && (
            <span className="text-sm text-gray-600 bg-green-100 px-2 py-0.5 rounded-full">
              {item.dosage[size]}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-green-100 pt-3">
          <p className="text-sm text-gray-800"><strong>Why it helps:</strong> {item.benefit}</p>
          <p className="text-sm text-gray-800"><strong>Preparation:</strong> {item.preparation}</p>

          {!size && item.dosage && (
            <div className="grid grid-cols-2 gap-1 text-sm bg-green-50 p-2 rounded">
              <p className="font-semibold text-green-800 col-span-2 mb-1">📏 Dosage:</p>
              {item.dosage.small && <p><span className="text-gray-500">Small:</span> {item.dosage.small}</p>}
              {item.dosage.medium && <p><span className="text-gray-500">Medium:</span> {item.dosage.medium}</p>}
              {item.dosage.large && <p><span className="text-gray-500">Large:</span> {item.dosage.large}</p>}
              {item.dosage.xlarge && <p><span className="text-gray-500">X-Large:</span> {item.dosage.xlarge}</p>}
            </div>
          )}

          <p className="text-xs text-gray-400 italic">📚 {item.citation}</p>
        </div>
      )}
    </div>
  );
}

export default function ImproveKibbleCard({ foodData, dogData }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleImprove = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `A dog owner is feeding their ${dogData?.dogWeight || ''} lb dog the kibble: "${foodData?.dogFood || 'this kibble'}".

Ingredients: ${foodData?.ingredients || 'not provided'}

Based on credible university veterinary research (Cornell, UC Davis, Tufts, Purdue, Texas A&M), recommend specific NATURAL WHOLE FOODS that can be added to this kibble to make it nutritionally better.

For each food addition, provide:
1. The food item (e.g., eggs, sardines in water, blueberries, etc.)
2. Why it helps — specific nutritional benefit backed by a university study
3. Exact dosage by dog weight (small <20lbs, medium 20-50lbs, large 50-90lbs, x-large 90+lbs)
4. How to prepare it
5. University citation

Focus on practical, affordable whole foods. Include at least 6 recommendations. Do NOT recommend supplements — only real whole foods.`,
        response_json_schema: {
          type: "object",
          properties: {
            additions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  food: { type: "string" },
                  benefit: { type: "string" },
                  dosage: {
                    type: "object",
                    properties: {
                      small: { type: "string" },
                      medium: { type: "string" },
                      large: { type: "string" },
                      xlarge: { type: "string" }
                    }
                  },
                  preparation: { type: "string" },
                  citation: { type: "string" }
                }
              }
            }
          }
        }
      });
      setRecommendations(result.additions || []);
    } catch (error) {
      alert('Error getting recommendations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const dogSize = () => {
    const w = parseFloat(dogData?.dogWeight);
    if (!w) return null;
    if (w < 20) return 'small';
    if (w < 50) return 'medium';
    if (w < 90) return 'large';
    return 'xlarge';
  };

  const sizeLabel = { small: 'Small (<20 lbs)', medium: 'Medium (20–50 lbs)', large: 'Large (50–90 lbs)', xlarge: 'X-Large (90+ lbs)' };
  const size = dogSize();

  return (
    <div className="mt-6">
      {!recommendations ? (
        <Button
          onClick={handleImprove}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Finding Recommendations...</>
          ) : (
            <>🥩 How To Improve This Kibble</>
          )}
        </Button>
      ) : (
        <Card className="border-2 border-green-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-green-700">🥩 How To Improve This Kibble</CardTitle>
            <p className="text-sm text-gray-500">
              {foodData?.dogFood && <><strong>{foodData.dogFood}</strong> · </>}
              Tap each food to see details & dosage
              {size && <> · <span className="text-green-700 font-medium">{sizeLabel[size]}</span></>}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((item, idx) => (
              <FoodItem key={idx} item={item} size={size} sizeLabel={sizeLabel} />
            ))}

            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mt-3">
              💡 <strong>Pro Tip:</strong> Mix all additions into the kibble thoroughly — pour any liquid (sardine water, egg) over it so picky eaters eat everything in the bowl.
            </p>


          </CardContent>
        </Card>
      )}
    </div>
  );
}