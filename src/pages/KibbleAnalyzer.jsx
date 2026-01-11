import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Calculator, Upload } from "lucide-react";
import { BrowserMultiFormatReader } from '@zxing/library';
import Tesseract from 'tesseract.js';

export default function KibbleAnalyzer() {
  const [dogData, setDogData] = useState({
    dogSize: 'medium',
    dogWeight: '',
    activityLevel: 'moderate',
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
    bagWeight: ''
  });

  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleDogChange = (field, value) => {
    setDogData(prev => ({ ...prev, [field]: value }));
  };

  const handleFoodChange = (field, value) => {
    setFoodData(prev => ({ ...prev, [field]: value }));
  };

  const processBarcodePhoto = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      const codeReader = new BrowserMultiFormatReader();
      const imageUrl = URL.createObjectURL(file);
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      handleFoodChange('dogFood', result.text);
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.error('Barcode scan error:', err);
    }
    setProcessing(false);
  };

  const processLabelPhoto = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file);
      
      // Parse nutrients from OCR text
      const omega3Match = text.match(/Omega[- ]?3\s*[:=]?\s*(\d+\.?\d*)/i);
      const omega6Match = text.match(/Omega[- ]?6\s*[:=]?\s*(\d+\.?\d*)/i);
      const proteinMatch = text.match(/Protein\s*[:=]?\s*(\d+\.?\d*)/i);
      const fatMatch = text.match(/Fat\s*[:=]?\s*(\d+\.?\d*)/i);
      const fiberMatch = text.match(/Fiber\s*[:=]?\s*(\d+\.?\d*)/i);
      const moistureMatch = text.match(/Moisture\s*[:=]?\s*(\d+\.?\d*)/i);
      
      if (omega3Match) handleFoodChange('omega3', omega3Match[1]);
      if (omega6Match) handleFoodChange('omega6', omega6Match[1]);
      if (proteinMatch) handleFoodChange('crudeProtein', proteinMatch[1]);
      if (fatMatch) handleFoodChange('crudeFat', fatMatch[1]);
      if (fiberMatch) handleFoodChange('crudeFiber', fiberMatch[1]);
      if (moistureMatch) handleFoodChange('moisture', moistureMatch[1]);
    } catch (err) {
      console.error('OCR error:', err);
    }
    setProcessing(false);
  };

  const processPricePhoto = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file);
      
      const priceMatch = text.match(/\$(\d+\.?\d*)/);
      const weightMatch = text.match(/(\d+)\s*lb/i);
      
      if (priceMatch) handleFoodChange('priceBag', priceMatch[1]);
      if (weightMatch) handleFoodChange('bagWeight', weightMatch[1]);
    } catch (err) {
      console.error('Price OCR error:', err);
    }
    setProcessing(false);
  };

  const analyzeKibble = () => {
    const weight = parseFloat(dogData.dogWeight);
    const kcalCup = parseFloat(foodData.kcalCup);
    const recommendedCups = parseFloat(foodData.recommendedFeeding) || 0;
    const priceBag = parseFloat(foodData.priceBag) || 0;
    const bagWeight = parseFloat(foodData.bagWeight) || 1;

    if (!weight || !kcalCup) {
      alert('Please enter at least Dog Weight and Calorie Content (kcal/cup)');
      return;
    }

    // Calculate daily caloric needs (RER formula)
    const rer = 70 * Math.pow(weight, 0.75);
    const activityMultiplier = {
      'sedentary': 1.2,
      'moderate': 1.6,
      'highly active/working': 2.0
    }[dogData.activityLevel] || 1.6;
    
    const dailyCalories = rer * activityMultiplier;
    const cupsNeeded = dailyCalories / kcalCup;
    const costPerDay = priceBag > 0 && bagWeight > 0 ? (priceBag / bagWeight) * (cupsNeeded / 4) : 0; // 4 cups per lb
    const costPerMonth = costPerDay * 30;

    // Nutrient analysis
    const omega3 = parseFloat(foodData.omega3) || 0;
    const omega6 = parseFloat(foodData.omega6) || 0;
    const omega6to3Ratio = omega3 > 0 ? omega6 / omega3 : 0;

    const analysis = {
      dailyCalories: dailyCalories.toFixed(0),
      recommendedCups: cupsNeeded.toFixed(2),
      brandCups: recommendedCups.toFixed(2),
      costPerDay: costPerDay.toFixed(2),
      costPerMonth: costPerMonth.toFixed(2),
      omega6to3Ratio: omega6to3Ratio.toFixed(1),
      recommendations: []
    };

    // Add recommendations
    if (omega6to3Ratio > 10) {
      analysis.recommendations.push('Omega-6 to Omega-3 ratio is high. Consider supplementation.');
    }
    if (parseFloat(foodData.vitaminE) < 100) {
      analysis.recommendations.push('Vitamin E is below optimal levels.');
    }
    if (parseFloat(foodData.glucosamine) < 400) {
      analysis.recommendations.push('Glucosamine levels are low - consider joint supplements.');
    }

    setResults(analysis);
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
              Enter your dog's details and food label data, or upload photos to auto-fill
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="photos">Photo Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
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
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="highly active/working">Highly Active/Working</SelectItem>
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
                <div className="md:col-span-2">
                  <Label>Dog Food Name</Label>
                  <Input
                    placeholder="e.g., 4health Salmon & Potato"
                    value={foodData.dogFood}
                    onChange={(e) => handleFoodChange('dogFood', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Recommended Feeding (cups/day)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
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
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">Upload Photos to Auto-Fill</CardTitle>
                <p className="text-sm text-gray-600">Upload clear photos of the barcode, label, and price tag</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Barcode Photo
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => processBarcodePhoto(e.target.files[0])}
                    disabled={processing}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Label Photo (Nutrition Facts)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => processLabelPhoto(e.target.files[0])}
                    disabled={processing}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Price Tag Photo
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => processPricePhoto(e.target.files[0])}
                    disabled={processing}
                  />
                </div>

                {processing && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Processing image...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          onClick={analyzeKibble}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mt-6"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Analyze Kibble
        </Button>

        {results && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-700">Daily Calorie Needs</h3>
                  <p className="text-3xl font-bold text-blue-600">{results.dailyCalories} kcal</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-700">Recommended Cups/Day</h3>
                  <p className="text-3xl font-bold text-blue-600">{results.recommendedCups} cups</p>
                  <p className="text-sm text-gray-600">Brand suggests: {results.brandCups} cups</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-700">Cost Per Day</h3>
                  <p className="text-3xl font-bold text-green-600">${results.costPerDay}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-700">Cost Per Month</h3>
                  <p className="text-3xl font-bold text-green-600">${results.costPerMonth}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg text-gray-700 mb-3">Nutritional Analysis</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Omega-6 to Omega-3 Ratio:</span> {results.omega6to3Ratio}:1
                    {parseFloat(results.omega6to3Ratio) > 10 && 
                      <span className="text-orange-600 ml-2">(High)</span>
                    }
                  </p>
                </div>
              </div>

              {results.recommendations.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg text-orange-800 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white p-6 rounded-lg shadow border-2 border-red-200">
                <h3 className="font-semibold text-lg text-gray-700 mb-2">Recommended Supplement</h3>
                <p className="text-gray-600 mb-3">
                  For optimal health, consider adding high-quality supplements to your dog's diet:
                </p>
                <a 
                  href="https://www.nuvet.com/54321" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 font-bold underline text-lg hover:text-red-700"
                >
                  Check out NuVet Plus Supplements →
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}