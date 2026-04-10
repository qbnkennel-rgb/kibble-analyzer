import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Detect if an ingredient name is a "meal" protein source
function isMealProtein(name) {
  return /\bmeal\b/i.test(name) && /\b(chicken|fish|beef|lamb|turkey|salmon|herring|pork|duck|venison|bison|whitefish|menhaden|anchovy|ocean|meat)\b/i.test(name);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const analyses = await base44.asServiceRole.entities.Analysis.list();
    
    let updated = 0;
    let skipped = 0;
    const results = [];

    for (const analysis of analyses) {
      const ingredientGrade = analysis.analysisData?.ingredientAnalysis?.ingredient_grade;
      if (!ingredientGrade?.ingredients?.length) {
        skipped++;
        continue;
      }

      let changed = false;
      const updatedIngredients = ingredientGrade.ingredients.map(ing => {
        if (isMealProtein(ing.name) && ing.score !== -1) {
          changed = true;
          return { ...ing, score: -1, reasoning: ing.reasoning + ' [Re-graded: meal proteins are scored -1 per updated policy]' };
        }
        return ing;
      });

      if (!changed) {
        skipped++;
        results.push({ kibble: analysis.kibbleName, status: 'no_change' });
        continue;
      }

      // Recalculate totals
      const totalScore = updatedIngredients.reduce((sum, i) => sum + i.score, 0);
      const avgScore = totalScore / updatedIngredients.length;
      const positiveCount = updatedIngredients.filter(i => i.score > 0).length;
      const negativeCount = updatedIngredients.filter(i => i.score < 0).length;
      const grade = avgScore >= 3 ? 'EXCELLENT' : avgScore >= 2 ? 'GOOD' : avgScore >= 0 ? 'AVERAGE' : 'POOR';

      const updatedIngredientGrade = {
        ...ingredientGrade,
        ingredients: updatedIngredients,
        total_score: totalScore,
        average_score: avgScore,
        positive_count: positiveCount,
        negative_count: negativeCount,
        grade
      };

      const updatedAnalysisData = {
        ...analysis.analysisData,
        ingredientAnalysis: {
          ...analysis.analysisData.ingredientAnalysis,
          ingredient_grade: updatedIngredientGrade
        }
      };

      await base44.asServiceRole.entities.Analysis.update(analysis.id, {
        analysisData: updatedAnalysisData
      });

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));

      updated++;
      results.push({ kibble: analysis.kibbleName, status: 'updated', new_grade: grade, avg_score: avgScore.toFixed(2) });
    }

    return Response.json({ total: analyses.length, updated, skipped, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});