import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
      {!recommendations && (
        <Button
          onClick={handleImprove}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Finding University-Backed Recommendations...</>
          ) : (
            <>🥩 How To Improve This Kibble</>
          )}
        </Button>
      )}

      {recommendations && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
              🥩 How To Improve This Kibble
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              University-backed whole food additions for <strong>{foodData?.dogFood || 'your kibble'}</strong>
              {size && <span> • Dosages shown for your dog's size: <strong>{sizeLabel[size]}</strong></span>}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border-l-4 border-green-500 p-4">
                <p className="font-bold text-green-800 text-lg">🌿 {item.food}</p>
                <p className="text-gray-800 mt-1"><strong>Why it helps:</strong> {item.benefit}</p>
                <p className="text-gray-800 mt-1"><strong>How to prepare:</strong> {item.preparation}</p>
                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-800 text-sm mb-1">📏 Recommended Dosage:</p>
                  {size && item.dosage?.[size] ? (
                    <p className="text-gray-800 font-bold">{sizeLabel[size]}: {item.dosage[size]}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      {item.dosage?.small && <p><span className="text-gray-600">Small:</span> {item.dosage.small}</p>}
                      {item.dosage?.medium && <p><span className="text-gray-600">Medium:</span> {item.dosage.medium}</p>}
                      {item.dosage?.large && <p><span className="text-gray-600">Large:</span> {item.dosage.large}</p>}
                      {item.dosage?.xlarge && <p><span className="text-gray-600">X-Large:</span> {item.dosage.xlarge}</p>}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">📚 {item.citation}</p>
              </div>
            ))}

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800">💡 Pro Tip from QBN Kennel</p>
              <p className="text-sm text-gray-700 mt-1">
                Mix all additions thoroughly into the kibble so picky eaters consume everything in the bowl. Pour any liquid (like sardine water or egg) directly over the kibble and mix well.
              </p>
            </div>

            <Button
              onClick={() => setRecommendations(null)}
              variant="outline"
              className="w-full mt-2"
            >
              Refresh Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}