import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function FoodLabelCard({
  foodData,
  language,
  t,
  fileInputKey,
  onFoodChange,
  onNutritionPhotoUpload,
  onIngredientsPhotoUpload,
  onPricePhotoUpload,
  onPriceOnlyPhotoUpload,
  onFeedingPhotoUpload,
  onSaveFoodData,
  onResetFoodData,
  analyzingNutrition,
  analyzingIngredients,
  analyzingPrice,
  analyzingPriceOnly,
  analyzingFeeding
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-blue-600">{t.foodLabel}</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onSaveFoodData}
              className="bg-green-600 hover:bg-green-700"
            >
              {t.save}
            </Button>
            <Button
              onClick={onResetFoodData}
              variant="outline"
            >
              {t.reset}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Label className="text-base font-semibold text-blue-700 mb-2 block">
            📸 {t.quickFillNutrition}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              key={`nutrition-${fileInputKey}`}
              type="file"
              accept="image/*"
              onChange={onNutritionPhotoUpload}
              disabled={analyzingNutrition}
              className="flex-1"
            />
            {analyzingNutrition && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t.analyzing}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {t.uploadClearPhoto}
          </p>
        </div>

        <div className="md:col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
          <Label className="text-base font-semibold text-green-700 mb-2 block">
            📸 {t.quickFillIngredients}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              key={`ingredients-${fileInputKey}`}
              type="file"
              accept="image/*"
              onChange={onIngredientsPhotoUpload}
              disabled={analyzingIngredients}
              className="flex-1"
            />
            {analyzingIngredients && (
              <div className="flex items-center gap-2 text-green-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t.analyzing}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {t.uploadClearPhoto}
          </p>
        </div>

        <div className="md:col-span-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <Label className="text-base font-semibold text-orange-700 mb-2 block">
            📸 {t.quickFillBag}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              key={`price-${fileInputKey}`}
              type="file"
              accept="image/*"
              onChange={onPricePhotoUpload}
              disabled={analyzingPrice}
              className="flex-1"
            />
            {analyzingPrice && (
              <div className="flex items-center gap-2 text-orange-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t.analyzing}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {t.uploadBarcode}
          </p>
        </div>

        <div className="md:col-span-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <Label className="text-base font-semibold text-purple-700 mb-2 block">
            📸 {t.quickFillPrice}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              key={`priceonly-${fileInputKey}`}
              type="file"
              accept="image/*"
              onChange={onPriceOnlyPhotoUpload}
              disabled={analyzingPriceOnly}
              className="flex-1"
            />
            {analyzingPriceOnly && (
              <div className="flex items-center gap-2 text-purple-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t.analyzing}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {t.uploadPriceTag}
          </p>
        </div>

        <div className="md:col-span-2 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <Label className="text-base font-semibold text-teal-700 mb-2 block">
            📸 {t.quickFillFeeding}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              key={`feeding-${fileInputKey}`}
              type="file"
              accept="image/*"
              onChange={onFeedingPhotoUpload}
              disabled={analyzingFeeding}
              className="flex-1"
            />
            {analyzingFeeding && (
              <div className="flex items-center gap-2 text-teal-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t.analyzing}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {t.uploadFeeding}
          </p>
        </div>

        <div>
          <Label>{t.priceBag}</Label>
          <Input
            type="number"
            step="0.01"
            placeholder={language === 'en' ? "e.g., 54.99" : "ej., 54.99"}
            value={foodData.priceBag}
            onChange={(e) => onFoodChange('priceBag', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.bagWeight}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 35" : "ej., 35"}
            value={foodData.bagWeight}
            onChange={(e) => onFoodChange('bagWeight', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.recommendedFeeding}</Label>
          <Input
            type="number"
            step="0.01"
            placeholder={language === 'en' ? "e.g., 3.5" : "ej., 3.5"}
            value={foodData.recommendedFeeding}
            onChange={(e) => onFoodChange('recommendedFeeding', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Label>{t.dogFoodName}</Label>
          <Input
            placeholder={language === 'en' ? "e.g., 4health Salmon & Potato" : "ej., 4health Salmón & Papa"}
            value={foodData.dogFood}
            onChange={(e) => onFoodChange('dogFood', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Label>{t.ingredientsList}</Label>
          <textarea
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
            placeholder={language === 'en' ? "e.g., Salmon, brown rice, oatmeal, chicken fat..." : "ej., Salmón, arroz integral, avena, grasa de pollo..."}
            value={foodData.ingredients}
            onChange={(e) => onFoodChange('ingredients', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.calorieKg}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 3560" : "ej., 3560"}
            value={foodData.kcalKg}
            onChange={(e) => onFoodChange('kcalKg', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.calorieCup}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 364" : "ej., 364"}
            value={foodData.kcalCup}
            onChange={(e) => onFoodChange('kcalCup', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.omega3}</Label>
          <Input
            type="number"
            step="0.01"
            placeholder={language === 'en' ? "e.g., 0.5" : "ej., 0.5"}
            value={foodData.omega3}
            onChange={(e) => onFoodChange('omega3', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.omega6}</Label>
          <Input
            type="number"
            step="0.01"
            placeholder={language === 'en' ? "e.g., 2.5" : "ej., 2.5"}
            value={foodData.omega6}
            onChange={(e) => onFoodChange('omega6', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.vitaminE}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 150" : "ej., 150"}
            value={foodData.vitaminE}
            onChange={(e) => onFoodChange('vitaminE', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.selenium}</Label>
          <Input
            type="number"
            step="0.01"
            placeholder={language === 'en' ? "e.g., 0.35" : "ej., 0.35"}
            value={foodData.selenium}
            onChange={(e) => onFoodChange('selenium', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.zinc}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 150" : "ej., 150"}
            value={foodData.zinc}
            onChange={(e) => onFoodChange('zinc', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.crudeProtein}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 25" : "ej., 25"}
            value={foodData.crudeProtein}
            onChange={(e) => onFoodChange('crudeProtein', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.crudeFat}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 14" : "ej., 14"}
            value={foodData.crudeFat}
            onChange={(e) => onFoodChange('crudeFat', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.crudeFiber}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 4" : "ej., 4"}
            value={foodData.crudeFiber}
            onChange={(e) => onFoodChange('crudeFiber', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.moisture}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 10" : "ej., 10"}
            value={foodData.moisture}
            onChange={(e) => onFoodChange('moisture', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.taurine}</Label>
          <Input
            type="number"
            step="0.01"
            placeholder={language === 'en' ? "e.g., 0.12" : "ej., 0.12"}
            value={foodData.taurine}
            onChange={(e) => onFoodChange('taurine', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.glucosamine}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 300" : "ej., 300"}
            value={foodData.glucosamine}
            onChange={(e) => onFoodChange('glucosamine', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.chondroitin}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 100" : "ej., 100"}
            value={foodData.chondroitin}
            onChange={(e) => onFoodChange('chondroitin', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}