import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function KibbleRanking({ analyses, dogFoodGoal, onGoalChange }) {
  const rankedKibbles = useMemo(() => {
    if (!analyses || analyses.length === 0) return [];

    // Map goal to health area
    const goalToAreaMap = {
      'overall health': 'overall',
      'allergies': 'Allergy Control',
      'skin/coat health': 'Skin & Coat Health',
      'heart health': 'Heart Health',
      'joint health': 'Joint Health',
      'reproduction': 'Reproduction'
    };

    const targetArea = goalToAreaMap[dogFoodGoal] || 'overall';

    // Get latest analysis for each unique kibble
    const kibbleMap = new Map();
    analyses.forEach(analysis => {
      const name = analysis.kibbleName;
      if (!kibbleMap.has(name) || new Date(analysis.created_date) > new Date(kibbleMap.get(name).created_date)) {
        kibbleMap.set(name, analysis);
      }
    });

    // Calculate scores and rank
    const scored = Array.from(kibbleMap.values()).map(analysis => {
      let score = analysis.overallScore;
      
      if (targetArea !== 'overall' && analysis.analysisData?.healthScores) {
        const areaScore = analysis.analysisData.healthScores.find(
          s => s.area === targetArea
        );
        if (areaScore) {
          // Weighted: 70% area-specific, 30% overall
          score = Math.round(areaScore.score * 0.7 + analysis.overallScore * 0.3);
        }
      }

      return {
        name: analysis.kibbleName,
        score,
        overallScore: analysis.overallScore,
        areaScore: targetArea !== 'overall' ? analysis.analysisData?.healthScores?.find(s => s.area === targetArea)?.score : null,
        created_date: analysis.created_date
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  }, [analyses, dogFoodGoal]);

  const topKibbles = rankedKibbles.slice(0, 5);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
  };

  const getRankBg = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
    if (index === 1) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
    if (index === 2) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
    return 'bg-white border-gray-200';
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl text-purple-700 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Kibble Rankings
        </CardTitle>
        <div className="mt-4">
          <Label className="text-purple-700 font-semibold">Dog Food Goal</Label>
          <Select value={dogFoodGoal} onValueChange={onGoalChange}>
            <SelectTrigger className="mt-1">
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
        <p className="text-sm text-gray-600 mt-3">
          Rankings based on your {dogFoodGoal} goal
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {rankedKibbles.length < 2 ? (
          <div className="p-4 bg-white rounded-lg text-center text-gray-600">
            {rankedKibbles.length === 0 ? 
              'No analyses yet - complete at least 2 analyses to see rankings' : 
              'Complete one more analysis to see rankings (need at least 2)'}
          </div>
        ) : (
          topKibbles.map((kibble, index) => (
          <div
            key={kibble.name}
            className={`p-4 rounded-lg border-2 ${getRankBg(index)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getRankIcon(index)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-lg">{kibble.name}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">Goal Score: </span>
                    <span className="font-bold text-purple-700">{kibble.score}/100</span>
                  </div>
                  {kibble.areaScore && (
                    <div>
                      <span className="text-gray-600">Area: </span>
                      <span className="font-semibold text-gray-700">{kibble.areaScore}/100</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Overall: </span>
                    <span className="font-semibold text-gray-700">{kibble.overallScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
        )}
      </CardContent>
    </>
  );
}