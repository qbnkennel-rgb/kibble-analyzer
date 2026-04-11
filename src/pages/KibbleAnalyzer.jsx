import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Loader2, X, History, MapPin, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { QRCodeSVG } from 'qrcode.react';
import LegalDisclosure from '../components/LegalDisclosure';
import KibbleRanking from '../components/KibbleRanking';
import DogInfoCard from '../components/DogInfoCard';
import FoodLabelCard from '../components/FoodLabelCard';
import AnnouncementBanner from '../components/AnnouncementBanner';
import VideoEducationCard from '../components/VideoEducationCard';
import FdaRecallCard from '../components/FdaRecallCard';
import AnalysisResults from '../components/AnalysisResults';
import BottomCards from '../components/BottomCards';
import PaywallModal from '../components/PaywallModal';

export default function KibbleAnalyzer() {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [language, setLanguage] = useState('en');
  const [dogData, setDogData] = useState({
    dogName: '',
    dogSize: 'medium',
    dogWeight: '',
    activityLevel: 'neutered adult',
    dogFoodGoal: 'anti-yeast',
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
  const [analyzingPriceOnly, setAnalyzingPriceOnly] = useState(false);
  const [analyzingFeeding, setAnalyzingFeeding] = useState(false);

  const [suggestion, setSuggestion] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [showPreviousAnalyses, setShowPreviousAnalyses] = useState(false);
  const [showNewDogInput, setShowNewDogInput] = useState(false);

  const [searchRadius, setSearchRadius] = useState('10');
  const [priceSearchResults, setPriceSearchResults] = useState(null);
  const [searchingPrices, setSearchingPrices] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showQROptions, setShowQROptions] = useState(false);
  const [foodDataSaved, setFoodDataSaved] = useState(false);
  const [recallInfo, setRecallInfo] = useState(null);
  const [checkingRecalls, setCheckingRecalls] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(true); // TEMP: full access mode

  const queryClient = useQueryClient();

  const { data: kibbles = [] } = useQuery({
    queryKey: ['kibbles'],
    queryFn: async () => {
      const result = await base44.entities.Kibble.list();
      console.log('Raw kibbles from DB:', result);
      return result;
    },
  });

  const { data: previousAnalyses = [] } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
    initialData: [],
  });

  const { data: savedDogs = [] } = useQuery({
    queryKey: ['dogs'],
    queryFn: async () => {
      const allDogs = await base44.entities.Dog.list();
      const myDogIds = JSON.parse(localStorage.getItem('myDogIds') || '[]');
      return allDogs.filter(dog => myDogIds.includes(dog.id));
    },
    initialData: [],
  });

  const deleteKibbleMutation = useMutation({
    mutationFn: (id) => base44.entities.Kibble.delete(id),
    onSuccess: () => {
      base44.analytics.track({ eventName: "kibble_deleted" });
      queryClient.invalidateQueries({ queryKey: ['kibbles'] });
    },
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: (id) => base44.entities.Analysis.delete(id),
    onSuccess: () => {
      base44.analytics.track({ eventName: "analysis_deleted" });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });

  useEffect(() => {
    const accepted = localStorage.getItem('kibbleAnalyzerTermsAccepted');
    if (accepted === 'true') {
      setHasAcceptedTerms(true);
    }
    // Check premium status and handle post-subscription redirect
    base44.functions.invoke('getSubscriptionStatus', {}).then(res => {
      if (res.data?.is_premium) setIsPremium(true);
    }).catch(() => {});
    // Handle successful subscription redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscribed') === 'true') {
      setIsPremium(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('kibbleAnalyzerTermsAccepted', 'true');
    setHasAcceptedTerms(true);
    base44.analytics.track({ eventName: "legal_terms_accepted" });
  };

  const translations = {
    en: {
      shareApp: "Share This App",
      clickToShare: "Click to share this QR code",
      downloadQR: "Download QR Code",
      copyLink: "Copy Link",
      shareEmail: "Share via Email",
      cancel: "Cancel",
      appTitle: "Kibble Analyzer App",
      enterDetails: "Enter your dog's details and food label data",
      previousAnalysis: "Previous Analysis",
      kibbleRankings: "Kibble Rankings",
      dogFoodGoal: "Dog Food Goal",
      rankingsBasedOn: "Rankings based on your",
      goal: "goal",
      noAnalyses: "No analyses yet - complete at least 2 analyses to see rankings",
      oneMoreAnalysis: "Complete one more analysis to see rankings (need at least 2)",
      overallHealth: "Overall Health",
      allergies: "Allergies",
      skinCoat: "Skin/Coat Health",
      heartHealth: "Heart Health",
      jointHealth: "Joint Health",
      reproduction: "Reproduction",
      dogInfo: "Dog Information",
      language: "Language",
      dogName: "Dog Name",
      addNewDog: "+ Add New Dog",
      selectDog: "Select a dog or add new...",
      dogSize: "Dog Size",
      toy: "Toy",
      small: "Small",
      medium: "Medium",
      large: "Large",
      xLarge: "X-Large",
      dogWeight: "Dog Weight (lbs)",
      activityLevel: "Activity Level",
      inactiveSenior: "Inactive/Senior",
      neuteredAdult: "Neutered Adult (Average)",
      activeIntact: "Active/Intact Adult",
      highlyActive: "Highly Active/Working",
      zipCode: "Zip Code",
      ageYears: "Age (Years)",
      ageMonths: "Age (Months)",
      optional: "Optional",
      foodLabel: "Food Label Data",
      save: "Save",
      reset: "Reset",
      quickFillNutrition: "Quick Fill: Upload Photo of Nutritional Label",
      analyzing: "Analyzing...",
      uploadClearPhoto: "Upload a clear photo of the nutritional label to auto-fill nutrition data",
      quickFillIngredients: "Quick Fill: Upload Photo of Ingredients List",
      quickFillBag: "Quick Fill: Upload Photo of Front Of Bag",
      uploadBarcode: "Upload barcode, product bag, or price tag to auto-fill brand, product name, price, and weight",
      quickFillPrice: "Quick Fill: Upload Photo of Price Tag",
      uploadPriceTag: "Upload a clear photo of the price tag to auto-fill bag price",
      quickFillFeeding: "Quick Fill: Upload Photo of Feeding Guide",
      uploadFeeding: "Upload a clear photo of the feeding guide/chart to auto-fill recommended feeding",
      priceBag: "Price per Bag (USD)",
      bagWeight: "Bag Weight (lbs)",
      recommendedFeeding: "Recommended Feeding (cups/day)",
      dogFoodName: "Dog Food Name",
      ingredientsList: "Ingredients List",
      calorieKg: "Calorie Content (kcal/kg)",
      calorieCup: "Calorie Content (kcal/cup)",
      omega3: "Omega-3 (%)",
      omega6: "Omega-6 (%)",
      vitaminE: "Vitamin E (IU/kg)",
      selenium: "Selenium (mg/kg)",
      zinc: "Zinc (mg/kg)",
      crudeProtein: "Crude Protein (%)",
      crudeFat: "Crude Fat (%)",
      crudeFiber: "Crude Fiber (%)",
      moisture: "Moisture (%)",
      taurine: "Taurine (%)",
      glucosamine: "Glucosamine (mg/kg)",
      chondroitin: "Chondroitin (mg/kg)",
      analyzeKibble: "Analyze Kibble",
      saved: "Saved",
      linkCopied: "Link copied to clipboard!",
      appSuggestions: "App Improvement Suggestions",
      shareSuggestion: "Share your suggestions for improving this app...",
      submitSuggestion: "Submit Suggestion",
      sending: "Sending...",
      learnRaw: "Learn to Feed Raw",
      pawLicking: "Does Your Dog Lick His/Her Paws or Smell Like Corn Chips?",
      nutritionalSecrets: "Nutritional Secrets",
      rawFeedingTitle: "Video Education Sources",
      fdaRecalls: "FDA Recall Checker",
      checkRecalls: "Check FDA Recalls",
      checkingRecalls: "Checking...",
      recallCheckerDesc: "Search for FDA recalls on your dog food. The app will also automatically check when you analyze.",
      enterFoodName: "Enter a dog food name to check for recalls"
      },
      es: {
      shareApp: "Compartir Esta App",
      clickToShare: "Haz clic para compartir este código QR",
      downloadQR: "Descargar Código QR",
      copyLink: "Copiar Enlace",
      shareEmail: "Compartir por Correo",
      cancel: "Cancelar",
      appTitle: "Aplicación Analizador de Croquetas",
      enterDetails: "Ingresa los detalles de tu perro y datos de la etiqueta del alimento",
      previousAnalysis: "Análisis Anteriores",
      kibbleRankings: "Clasificación de Croquetas",
      dogFoodGoal: "Objetivo del Alimento",
      rankingsBasedOn: "Clasificaciones basadas en tu objetivo de",
      goal: "",
      noAnalyses: "Aún no hay análisis - completa al menos 2 análisis para ver clasificaciones",
      oneMoreAnalysis: "Completa un análisis más para ver clasificaciones (se necesitan al menos 2)",
      overallHealth: "Salud General",
      allergies: "Alergias",
      skinCoat: "Salud de Piel/Pelaje",
      heartHealth: "Salud Cardíaca",
      jointHealth: "Salud Articular",
      reproduction: "Reproducción",
      dogInfo: "Información del Perro",
      language: "Idioma",
      dogName: "Nombre del Perro",
      addNewDog: "+ Agregar Nuevo Perro",
      selectDog: "Selecciona un perro o agrega uno nuevo...",
      dogSize: "Tamaño del Perro",
      toy: "Juguete",
      small: "Pequeño",
      medium: "Mediano",
      large: "Grande",
      xLarge: "Extra Grande",
      dogWeight: "Peso del Perro (lbs)",
      activityLevel: "Nivel de Actividad",
      inactiveSenior: "Inactivo/Senior",
      neuteredAdult: "Adulto Castrado (Promedio)",
      activeIntact: "Adulto Activo/Intacto",
      highlyActive: "Muy Activo/Trabajador",
      zipCode: "Código Postal",
      ageYears: "Edad (Años)",
      ageMonths: "Edad (Meses)",
      optional: "Opcional",
      foodLabel: "Datos de la Etiqueta del Alimento",
      save: "Guardar",
      reset: "Reiniciar",
      quickFillNutrition: "Llenado Rápido: Sube Foto de la Etiqueta Nutricional",
      analyzing: "Analizando...",
      uploadClearPhoto: "Sube una foto clara de la etiqueta nutricional para auto-llenar datos de nutrición",
      quickFillIngredients: "Llenado Rápido: Sube Foto de la Lista de Ingredientes",
      quickFillBag: "Llenado Rápido: Sube Foto del Frente de la Bolsa",
      uploadBarcode: "Sube código de barras, bolsa del producto o etiqueta de precio para auto-llenar marca, nombre del producto, precio y peso",
      quickFillPrice: "Llenado Rápido: Sube Foto de la Etiqueta de Precio",
      uploadPriceTag: "Sube una foto clara de la etiqueta de precio para auto-llenar el precio de la bolsa",
      quickFillFeeding: "Llenado Rápido: Sube Foto de la Guía de Alimentación",
      uploadFeeding: "Sube una foto clara de la guía/tabla de alimentación para auto-llenar la alimentación recomendada",
      priceBag: "Precio por Bolsa (USD)",
      bagWeight: "Peso de la Bolsa (lbs)",
      recommendedFeeding: "Alimentación Recomendada (tazas/día)",
      dogFoodName: "Nombre del Alimento para Perros",
      ingredientsList: "Lista de Ingredientes",
      calorieKg: "Contenido Calórico (kcal/kg)",
      calorieCup: "Contenido Calórico (kcal/taza)",
      omega3: "Omega-3 (%)",
      omega6: "Omega-6 (%)",
      vitaminE: "Vitamina E (UI/kg)",
      selenium: "Selenio (mg/kg)",
      zinc: "Zinc (mg/kg)",
      crudeProtein: "Proteína Cruda (%)",
      crudeFat: "Grasa Cruda (%)",
      crudeFiber: "Fibra Cruda (%)",
      moisture: "Humedad (%)",
      taurine: "Taurina (%)",
      glucosamine: "Glucosamina (mg/kg)",
      chondroitin: "Condroitina (mg/kg)",
      analyzeKibble: "Analizar Croquetas",
      saved: "Guardado",
      linkCopied: "¡Enlace copiado al portapapeles!",
      appSuggestions: "Sugerencias de Mejora de la App",
      shareSuggestion: "Comparte tus sugerencias para mejorar esta aplicación...",
      submitSuggestion: "Enviar Sugerencia",
      sending: "Enviando...",
      learnRaw: "Aprende a Alimentar Crudo",
      pawLicking: "¿Tu Perro Se Lame Las Patas o Huele a Chips de Maíz?",
      nutritionalSecrets: "Secretos Nutricionales",
      rawFeedingTitle: "Fuentes de Educación en Video",
      fdaRecalls: "Verificador de Retiros de la FDA",
      checkRecalls: "Verificar Retiros de la FDA",
      checkingRecalls: "Verificando...",
      recallCheckerDesc: "Busca retiros de la FDA en tu comida para perros. La aplicación también verificará automáticamente cuando analices.",
      enterFoodName: "Ingresa un nombre de comida para perros para verificar retiros"
      }
      };

  const t = translations[language];

  const handleDogChange = (field, value) => {
    setDogData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNewDog = async () => {
    if (!dogData.dogName || !showNewDogInput) return;
    
    const existingDog = savedDogs.find(d => d.name === dogData.dogName);
    if (existingDog) {
      alert('A dog with this name already exists');
      return;
    }

    try {
      const newDog = await base44.entities.Dog.create({
        name: dogData.dogName,
        size: dogData.dogSize,
        weight: dogData.dogWeight,
        activityLevel: dogData.activityLevel,
        foodGoal: dogData.dogFoodGoal,
        zipCode: dogData.zipCode,
        ageYears: dogData.ageYears,
        ageMonths: dogData.ageMonths
      });
      
      // Track this dog as belonging to this user/browser
      const myDogs = JSON.parse(localStorage.getItem('myDogIds') || '[]');
      myDogs.push(newDog.id);
      localStorage.setItem('myDogIds', JSON.stringify(myDogs));
      
      await queryClient.invalidateQueries({ queryKey: ['dogs'] });
      setShowNewDogInput(false);
      base44.analytics.track({ eventName: "dog_profile_created", properties: { dog_name: dogData.dogName } });
    } catch (error) {
      alert('Error saving dog: ' + error.message);
    }
  };

  const handleDeleteDog = async () => {
    if (!dogData.dogName) return;
    
    const dogToDelete = savedDogs.find(d => d.name === dogData.dogName);
    if (!dogToDelete) return;

    if (confirm(`Delete ${dogData.dogName}?`)) {
      try {
        await base44.entities.Dog.delete(dogToDelete.id);
        
        // Remove from localStorage
        const myDogs = JSON.parse(localStorage.getItem('myDogIds') || '[]');
        const updatedDogs = myDogs.filter(id => id !== dogToDelete.id);
        localStorage.setItem('myDogIds', JSON.stringify(updatedDogs));
        
        await queryClient.invalidateQueries({ queryKey: ['dogs'] });
        setDogData({
          dogName: '',
          dogSize: 'medium',
          dogWeight: '',
          activityLevel: 'neutered adult',
          dogFoodGoal: 'overall health',
          zipCode: '',
          ageYears: '',
          ageMonths: ''
        });
        base44.analytics.track({ eventName: "dog_profile_deleted" });
      } catch (error) {
        alert('Error deleting dog: ' + error.message);
      }
    }
  };

  const handleLoadDog = (dogName) => {
    const dog = savedDogs.find(d => d.name === dogName);
    if (dog) {
      setDogData({
        dogName: dog.name,
        dogSize: dog.size || 'medium',
        dogWeight: dog.weight || '',
        activityLevel: dog.activityLevel || 'neutered adult',
        dogFoodGoal: dog.foodGoal || 'overall health',
        zipCode: dog.zipCode || '',
        ageYears: dog.ageYears || '',
        ageMonths: dog.ageMonths || ''
      });
      base44.analytics.track({ eventName: "dog_profile_loaded", properties: { dog_name: dogName } });
    }
  };

  const handleFoodChange = (field, value) => {
    setFoodData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-update dog profile when data changes
  useEffect(() => {
    if (!dogData.dogName || showNewDogInput) return;
    
    const timeoutId = setTimeout(async () => {
      const existingDog = savedDogs.find(d => d.name === dogData.dogName);
      if (existingDog) {
        try {
          await base44.entities.Dog.update(existingDog.id, {
            size: dogData.dogSize,
            weight: dogData.dogWeight,
            activityLevel: dogData.activityLevel,
            foodGoal: dogData.dogFoodGoal,
            zipCode: dogData.zipCode,
            ageYears: dogData.ageYears,
            ageMonths: dogData.ageMonths
          });
        } catch (error) {
          console.error('Error updating dog:', error);
        }
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [dogData, savedDogs, showNewDogInput]);

  const handleNutritionPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    base44.analytics.track({ eventName: "nutrition_photo_uploaded" });
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
      const fieldsFound = [];
      const fieldsNotFound = [];

      const fieldMapping = {
        dogFood: 'Product Name',
        recommendedFeeding: 'Feeding (cups/day)',
        kcalKg: 'Calories (kcal/kg)',
        kcalCup: 'Calories (kcal/cup)',
        omega3: 'Omega-3 (%)',
        omega6: 'Omega-6 (%)',
        vitaminE: 'Vitamin E (IU/kg)',
        selenium: 'Selenium (mg/kg)',
        zinc: 'Zinc (mg/kg)',
        crudeProtein: 'Crude Protein (%)',
        crudeFat: 'Crude Fat (%)',
        crudeFiber: 'Crude Fiber (%)',
        moisture: 'Moisture (%)',
        taurine: 'Taurine (%)',
        glucosamine: 'Glucosamine (mg/kg)',
        chondroitin: 'Chondroitin (mg/kg)'
      };

      Object.keys(fieldMapping).forEach(key => {
        if (result[key] != null) {
          updates[key] = key === 'dogFood' ? result[key] : result[key].toString();
          fieldsFound.push(fieldMapping[key]);
        } else {
          fieldsNotFound.push(fieldMapping[key]);
        }
      });

      setFoodData(prev => ({ ...prev, ...updates }));

      base44.analytics.track({ 
        eventName: "nutrition_data_extracted",
        properties: { fields_extracted: fieldsFound.length }
      });

      let message = `✅ Found ${fieldsFound.length} fields:\n${fieldsFound.join(', ')}\n\n`;
      if (fieldsNotFound.length > 0) {
        message += `❌ Not found (${fieldsNotFound.length}):\n${fieldsNotFound.join(', ')}\n\n`;
        message += 'Tip: Try a clearer photo with better lighting, or enter missing values manually.';
      }
      alert(message);
    } catch (error) {
      alert('Error analyzing photo: ' + error.message);
    } finally {
      setAnalyzingNutrition(false);
    }
  };

  const handleIngredientsPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    base44.analytics.track({ eventName: "ingredients_photo_uploaded" });
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
        base44.analytics.track({ 
          eventName: "ingredients_extracted",
          properties: { ingredient_count: result.ingredients.split(',').length }
        });
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

  const handlePriceOnlyPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    base44.analytics.track({ eventName: "price_only_photo_uploaded" });
    setAnalyzingPriceOnly(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract price information from this image (price tag, receipt, or product label).

LOOK FOR:
- Price: any $ amount, price tag, MSRP, retail price, sale price
- Extract the numerical value only

Return the price as a number. If not visible, return null.`,
        file_urls: [file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            priceBag: { type: "number" }
          }
        }
      });

      console.log('Extracted price:', result);
      
      if (result.priceBag != null) {
        setFoodData(prev => ({ ...prev, priceBag: result.priceBag.toString() }));
        base44.analytics.track({ 
          eventName: "price_only_extracted",
          properties: { price: result.priceBag }
        });
        alert(`Price extracted: $${result.priceBag}. Please review and adjust if needed.`);
      } else {
        alert('No price found. Please try a clearer photo or enter manually.');
      }
    } catch (error) {
      alert('Error analyzing price: ' + error.message);
    } finally {
      setAnalyzingPriceOnly(false);
    }
  };

  const handleFeedingPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    base44.analytics.track({ eventName: "feeding_photo_uploaded" });
    setAnalyzingFeeding(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract recommended feeding information from this dog food feeding guide/chart.

LOOK FOR:
- Feeding guide chart or table
- Recommended cups per day based on dog weight
- Daily feeding amount in cups

Extract the numerical value for cups per day. If there's a range, use the middle value.
Return as a number. If not visible, return null.`,
        file_urls: [file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            recommendedFeeding: { type: "number" }
          }
        }
      });

      console.log('Extracted feeding:', result);
      
      if (result.recommendedFeeding != null) {
        setFoodData(prev => ({ ...prev, recommendedFeeding: result.recommendedFeeding.toString() }));
        base44.analytics.track({ 
          eventName: "feeding_extracted",
          properties: { cups: result.recommendedFeeding }
        });
        alert(`Feeding amount extracted: ${result.recommendedFeeding} cups/day. Please review and adjust if needed.`);
      } else {
        alert('No feeding information found. Please try a clearer photo or enter manually.');
      }
    } catch (error) {
      alert('Error analyzing feeding guide: ' + error.message);
    } finally {
      setAnalyzingFeeding(false);
    }
  };

  const handlePricePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    base44.analytics.track({ eventName: "price_photo_uploaded" });
    setAnalyzingPrice(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image to extract dog food product information. This may be a barcode, price tag, product bag, or label.

  EXTRACTION INSTRUCTIONS:
  1. BARCODE RECOGNITION: If you see a UPC/barcode (series of vertical lines with numbers below):
   - Read the numerical barcode digits carefully
   - Use internet search to look up the product by barcode number
   - Extract brand, formula/product name, bag weight, and price from search results

  2. PRODUCT BAG/LABEL: If this is a photo of the actual dog food bag:
   - Read the brand name prominently displayed (e.g., "Blue Buffalo", "Purina", "Hill's Science Diet")
   - Read the specific formula/product line (e.g., "Chicken & Brown Rice Recipe", "Adult Large Breed")
   - Look for bag size: any weight like "30 lb", "15 kg", "40 lbs"
   - Look for price if visible on tag/sticker

  3. PRICE TAG/SHELF LABEL: If this is a store price label:
   - Read product name and brand from the label text
   - Extract price (any $ amount, MSRP, retail price, sale price)
   - Extract weight/size from label text

  4. GENERAL TEXT: Scan ALL visible text for:
   - Brand names (Blue Buffalo, Purina, Royal Canin, Hill's, IAMS, etc.)
   - Formula names (Life Protection Formula, Salmon & Potato, etc.)
   - Any numerical price ($XX.XX)
   - Any weight indication with "lb", "lbs", "kg", "pound", "ounces", "oz"

  IMPORTANT: 
  - Be thorough - extract EVERY piece of information you can find
  - If you find a barcode, USE INTERNET SEARCH to get complete product details
  - Return null only if truly not visible anywhere
  - Product name should include both brand AND specific formula`,
        file_urls: [file_url],
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            dogFood: { type: "string" },
            priceBag: { type: "number" },
            bagWeight: { type: "number" }
          }
        }
      });

      console.log('Extracted product data:', result);

      const updates = {};
      if (result.dogFood) updates.dogFood = result.dogFood;
      if (result.priceBag != null) updates.priceBag = result.priceBag.toString();
      if (result.bagWeight != null) updates.bagWeight = result.bagWeight.toString();

      setFoodData(prev => ({ ...prev, ...updates }));

      const extractedCount = Object.keys(updates).length;
      if (extractedCount > 0) {
        base44.analytics.track({ 
          eventName: "price_data_extracted",
          properties: { fields_extracted: extractedCount }
        });
        alert(`Extracted ${extractedCount} field(s)! Please review and adjust if needed.`);
      } else {
        alert('No product data found. Please try a clearer photo or enter manually.');
      }
    } catch (error) {
      alert('Error analyzing product: ' + error.message);
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

    // Paywall: limit free users to 2 analyses per month
    if (!isPremium) {
      const now = new Date();
      const monthKey = `analyses_${now.getFullYear()}_${now.getMonth()}`;
      const count = parseInt(localStorage.getItem(monthKey) || '0');
      if (count >= 1) {
        setShowPaywall(true);
        return;
      }
      localStorage.setItem(monthKey, (count + 1).toString());
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

    // Omega-3 and Omega-6 Fatty Acid Calculations
    // Based on National Research Council (NRC) and University of Guelph standards:
    // Dog food labels list omega fatty acids as MINIMUM percentage "as fed" basis
    // 
    // CRITICAL: Label percentages mean grams per 100g of food
    // Example: 0.5% omega-3 = 0.5g per 100g = 5g per 1000g (1kg)
    // 
    // Calculation: (percentage / 100) × daily food grams = grams per day
    // Then convert: omega-3 to mg (×1000), omega-6 stays in g

    const omega3Percentage = parseFloat(foodData.omega3) || 0;
    const omega6Percentage = parseFloat(foodData.omega6) || 0;

    // Calculate grams per day first
    const omega3GramsPerDay = (omega3Percentage / 100) * dailyFoodGrams;
    const omega6GramsPerDay = (omega6Percentage / 100) * dailyFoodGrams;

    // Omega-3: convert g to mg for display
    const dailyOmega3 = Math.round(omega3GramsPerDay * 1000);

    // Omega-6: keep in grams for display
    const dailyOmega6 = omega6GramsPerDay.toFixed(1);

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

          CRITICAL RULE: Any protein source with the word "meal" after it (e.g., chicken meal, fish meal, beef meal) MUST be scored -1, regardless of quality. Additionally, any ingredient containing "by-product meal" (e.g., chicken by-product meal, poultry by-product meal, meat by-product meal) MUST also be scored -1, regardless of quality.

          CRITICAL RULE: "Powdered cellulose" MUST always be scored exactly -2. It is a low-quality filler derived from wood pulp with no nutritional value for dogs. It MUST also be included as a red flag with concern: "Low-quality wood pulp filler" and health_impact: "Provides zero nutritional value; used as a cheap bulk filler that dilutes nutrient density in dog food."


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

    // Save kibble data to database
    if (foodData.dogFood) {
      await base44.entities.Kibble.create({
        name: foodData.dogFood,
        recommendedFeeding: foodData.recommendedFeeding,
        kcalKg: foodData.kcalKg,
        kcalCup: foodData.kcalCup,
        omega3: foodData.omega3,
        omega6: foodData.omega6,
        vitaminE: foodData.vitaminE,
        selenium: foodData.selenium,
        zinc: foodData.zinc,
        crudeProtein: foodData.crudeProtein,
        crudeFat: foodData.crudeFat,
        crudeFiber: foodData.crudeFiber,
        moisture: foodData.moisture,
        taurine: foodData.taurine,
        glucosamine: foodData.glucosamine,
        chondroitin: foodData.chondroitin,
        priceBag: foodData.priceBag,
        bagWeight: foodData.bagWeight,
        ingredients: foodData.ingredients
      });
      await queryClient.invalidateQueries({ queryKey: ['kibbles'] });
      base44.analytics.track({ 
        eventName: "kibble_saved",
        properties: { kibble_name: foodData.dogFood }
      });
    }

    // Save analysis to database
    const newAnalysis = await base44.entities.Analysis.create({
      kibbleName: foodData.dogFood || 'Unnamed',
      dogWeight: weight.toString(),
      overallScore: overallScore,
      analysisData: analysis,
      dogData: dogData,
      foodData: foodData
    });
    
    // Track this analysis as belonging to this user/browser
    const myAnalyses = JSON.parse(localStorage.getItem('myAnalysisIds') || '[]');
    myAnalyses.push(newAnalysis.id);
    localStorage.setItem('myAnalysisIds', JSON.stringify(myAnalyses));
    
    await queryClient.invalidateQueries({ queryKey: ['analyses'] });

    base44.analytics.track({ 
      eventName: "kibble_analyzed",
      properties: { 
        dog_weight: weight,
        overall_score: overallScore,
        kibble_name: foodData.dogFood,
        has_ingredients: !!foodData.ingredients
      }
    });

    // Check FDA recalls
    if (foodData.dogFood) {
      try {
        const recallData = await base44.functions.invoke('checkFdaRecalls', { 
          foodName: foodData.dogFood 
        });
        setRecallInfo(recallData.data);
      } catch (error) {
        console.error('Error checking recalls:', error);
      }
    }

    setResults(analysis);
    setAnalyzing(false);
    };

    const handleCheckRecalls = async () => {
    if (!foodData.dogFood) {
      alert('Please enter a dog food name first');
      return;
    }

    setCheckingRecalls(true);
    try {
      const recallData = await base44.functions.invoke('checkFdaRecalls', { 
        foodName: foodData.dogFood 
      });
      setRecallInfo(recallData.data);
      base44.analytics.track({ eventName: "manual_recall_check" });

      if (!recallData.data?.has_recall) {
        alert('Good news! No FDA recalls found for this product.');
      }
    } catch (error) {
      alert('Error checking recalls: ' + error.message);
    } finally {
      setCheckingRecalls(false);
    }
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

  const handleSuggestionSubmit = async () => {
    if (!suggestion.trim()) {
      alert('Please enter a suggestion');
      return;
    }

    setSubmittingSuggestion(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'raulfagundez@ymail.com',
        subject: 'APP SUGGESTION',
        body: suggestion
      });
      base44.analytics.track({ 
        eventName: "suggestion_submitted",
        properties: { suggestion_length: suggestion.length }
      });
      alert('Thank you! Your suggestion has been sent.');
      setSuggestion('');
    } catch (error) {
      alert('Error sending suggestion: ' + error.message);
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'kibble-analyzer-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    setShowQROptions(false);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(t.linkCopied);
    setShowQROptions(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out the Kibble Analyzer App');
    const body = encodeURIComponent(`I found this helpful app for analyzing dog food: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowQROptions(false);
  };

  const handleSaveFoodData = () => {
    setFoodDataSaved(true);
    alert(t.saved);
    setTimeout(() => setFoodDataSaved(false), 2000);
  };

  const handleResetFoodData = () => {
    setFoodData({
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
  };

  const handleBestRecommended = async () => {
    if (previousAnalyses.length < 5) {
      alert('You need at least 5 previous analyses to get a recommendation.');
      return;
    }

    try {
      const recommendation = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the following information, recommend the BEST dog food from the previous analyses:

Dog Information:
- Weight: ${dogData.dogWeight} lbs
- Size: ${dogData.dogSize}
- Activity Level: ${dogData.activityLevel}
- Dog Food Goal: ${dogData.dogFoodGoal}
- Zip Code: ${dogData.zipCode}
- Age: ${dogData.ageYears || 0} years ${dogData.ageMonths || 0} months

Previous Analyses:
${previousAnalyses.map(a => `
- ${a.kibbleName}: Score ${a.overallScore}/100
  Weight: ${a.dogWeight} lbs
  Analysis Data: ${JSON.stringify(a.analysisData?.healthScores?.map(s => `${s.area}: ${s.score}`) || [])}
`).join('\n')}

Consider the current season (January), the dog's specific goal (${dogData.dogFoodGoal}), activity level, and location. 
Which food from the previous analyses would you recommend and why? 
Focus specifically on how well it matches their goal.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_food: { type: "string" },
            reasoning: { type: "string" },
            key_benefits: { type: "array", items: { type: "string" } }
          }
        }
      });

      alert(`Recommended: ${recommendation.recommended_food}\n\nReasoning: ${recommendation.reasoning}\n\nKey Benefits:\n${recommendation.key_benefits.join('\n- ')}`);
    } catch (error) {
      alert('Error getting recommendation: ' + error.message);
    }
  };

  const searchNearbyPrices = async () => {
    if (!dogData.zipCode || !foodData.dogFood) {
      alert('Please enter zip code and dog food name first');
      return;
    }

    setSearchingPrices(true);
    setPriceSearchResults(null);

    try {
      // Get location coordinates
      const locationData = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the latitude and longitude coordinates for zip code ${dogData.zipCode}. Return only the coordinates.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" },
            city: { type: "string" },
            state: { type: "string" }
          }
        }
      });

      setUserLocation(locationData);

      // Search for prices
      const priceData = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for "${foodData.dogFood}" dog food prices and availability within ${searchRadius} miles of ${locationData.city}, ${locationData.state} (zip: ${dogData.zipCode}).

Find:
1. Local pet stores (Petco, PetSmart, local shops) with in-store or online prices
2. Online retailers (Chewy, Amazon, Walmart) that ship to this area
3. Current prices, any sales/promotions
4. Store addresses and phone numbers

Return up to 10 results with the most competitive prices. Include store name, price, bag size, location/website, and contact info.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  store_name: { type: "string" },
                  price: { type: "number" },
                  bag_size: { type: "string" },
                  location: { type: "string" },
                  distance: { type: "string" },
                  phone: { type: "string" },
                  website: { type: "string" },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      setPriceSearchResults(priceData.results);
      base44.analytics.track({ 
        eventName: "price_search_completed",
        properties: { results_count: priceData.results?.length || 0, radius: searchRadius }
      });
    } catch (error) {
      alert('Error searching prices: ' + error.message);
    } finally {
      setSearchingPrices(false);
    }
  };

  if (!hasAcceptedTerms) {
    return <LegalDisclosure onAccept={handleAcceptTerms} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <AnnouncementBanner />
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col items-center gap-2 relative">
                <p className="text-sm font-semibold text-blue-700 text-center">{t.shareApp}</p>
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity p-2 bg-blue-50 rounded-lg"
                  onClick={() => setShowQROptions(!showQROptions)}
                >
                  <QRCodeSVG 
                    value={window.location.href} 
                    size={100}
                    level="H"
                  />
                </div>
                <p className="text-xs text-gray-600 text-center">{t.clickToShare}</p>

                {showQROptions && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-blue-300 z-50">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={downloadQRCode}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                      >
                        📥 {t.downloadQR}
                      </button>
                      <button
                        onClick={copyLinkToClipboard}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                      >
                        📋 {t.copyLink}
                      </button>
                      <button
                        onClick={shareViaEmail}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                      >
                        ✉️ {t.shareEmail}
                      </button>
                      <button
                        onClick={() => setShowQROptions(false)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded transition-colors text-gray-600"
                      >
                        ✕ {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl text-center text-blue-600 flex items-center justify-center gap-2">
                  <span>🐶</span> {t.appTitle}
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">
                  {t.enterDetails}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPreviousAnalyses(true)}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                {t.previousAnalysis} ({previousAnalyses.length})
              </Button>
            </div>
            </CardHeader>
            </Card>

            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                  <p className="text-lg font-bold text-blue-700 mb-2">🔒 Premium Feature</p>
                  <p className="text-sm text-gray-600 mb-3">Subscribe to access Video Education</p>
                  <button onClick={() => setShowPaywall(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium text-sm">Upgrade for $1.99/mo</button>
                </div>
              )}
              <VideoEducationCard t={t} />
            </div>
            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                  <p className="text-lg font-bold text-red-700 mb-2">🔒 Premium Feature</p>
                  <p className="text-sm text-gray-600 mb-3">Subscribe to access FDA Recall Checker</p>
                  <button onClick={() => setShowPaywall(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium text-sm">Upgrade for $1.99/mo</button>
                </div>
              )}
              <FdaRecallCard t={t} foodData={foodData} checkingRecalls={checkingRecalls} onCheckRecalls={handleCheckRecalls} />
            </div>

            <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 relative overflow-hidden">
              {!isPremium && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                  <p className="text-lg font-bold text-purple-700 mb-2">🔒 Premium Feature</p>
                  <p className="text-sm text-gray-600 mb-3">Subscribe to unlock Kibble Rankings</p>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium text-sm"
                  >
                    Upgrade for $1.99/mo
                  </button>
                </div>
              )}
              <KibbleRanking 
                analyses={previousAnalyses} 
                dogFoodGoal={dogData.dogFoodGoal}
                onGoalChange={(val) => handleDogChange('dogFoodGoal', val)}
                language={language}
              />
            </Card>

        {showPreviousAnalyses && (
          <Card className="mb-8 border-2 border-blue-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">Previous Analyses</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPreviousAnalyses(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {previousAnalyses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No previous analyses yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {previousAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setResults(analysis.analysisData);
                        setDogData(analysis.dogData);
                        setFoodData(analysis.foodData);
                        setShowPreviousAnalyses(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{analysis.kibbleName}</p>
                          <p className="text-sm text-gray-600">
                            {analysis.dogData?.dogName && `${analysis.dogData.dogName} • `}{analysis.dogWeight} lbs • Score: {analysis.overallScore}/100
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(analysis.created_date).toLocaleDateString()} at {new Date(analysis.created_date).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setResults(analysis.analysisData);
                              setDogData(analysis.dogData);
                              setFoodData(analysis.foodData);
                              setShowPreviousAnalyses(false);
                              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            }}
                          >
                            View Results
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete analysis for "${analysis.kibbleName}"?`)) {
                                deleteAnalysisMutation.mutate(analysis.id);
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {dogData.zipCode && foodData.dogFood && (
          <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
            <CardHeader>
              <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Find Best Prices Near You
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Search for {foodData.dogFood} prices within your area
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Search Radius</Label>
                  <Select value={searchRadius} onValueChange={setSearchRadius}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="15">15 miles</SelectItem>
                      <SelectItem value="20">20 miles</SelectItem>
                      <SelectItem value="30">30 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={searchNearbyPrices}
                  disabled={searchingPrices}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {searchingPrices ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Search Prices
                    </>
                  )}
                </Button>
              </div>

              {userLocation && (
                <div className="h-64 rounded-lg overflow-hidden border-2 border-green-300">
                  <MapContainer
                    center={[userLocation.latitude, userLocation.longitude]}
                    zoom={11}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={[userLocation.latitude, userLocation.longitude]}>
                      <Popup>
                        Your Location<br />
                        {userLocation.city}, {userLocation.state}
                      </Popup>
                    </Marker>
                    <Circle
                      center={[userLocation.latitude, userLocation.longitude]}
                      radius={parseInt(searchRadius) * 1609.34}
                      pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
                    />
                  </MapContainer>
                </div>
              )}

              {priceSearchResults && priceSearchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Found {priceSearchResults.length} Results
                  </h3>
                  <div className="grid gap-3">
                    {priceSearchResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-400 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-800">{result.store_name}</p>
                            <p className="text-sm text-gray-600">{result.location}</p>
                            {result.distance && (
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                📍 {result.distance}
                              </p>
                            )}
                            {result.notes && (
                              <p className="text-sm text-gray-700 mt-2">{result.notes}</p>
                            )}
                            <div className="flex gap-3 mt-2">
                              {result.phone && (
                                <a
                                  href={`tel:${result.phone}`}
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  📞 {result.phone}
                                </a>
                              )}
                              {result.website && (
                                <a
                                  href={result.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  🌐 Visit Website
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-700">
                              ${result.price?.toFixed(2) || 'N/A'}
                            </p>
                            {result.bag_size && (
                              <p className="text-sm text-gray-600">{result.bag_size}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {priceSearchResults && priceSearchResults.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No results found. Try increasing your search radius or checking online retailers.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
            <DogInfoCard
              dogData={dogData}
              savedDogs={savedDogs}
              showNewDogInput={showNewDogInput}
              language={language}
              t={t}
              onDogChange={handleDogChange}
              onSaveNewDog={handleSaveNewDog}
              onDeleteDog={handleDeleteDog}
              onLoadDog={handleLoadDog}
              setShowNewDogInput={setShowNewDogInput}
              setLanguage={setLanguage}
              setDogData={setDogData}
            />

            <FoodLabelCard
              foodData={foodData}
              language={language}
              t={t}
              onFoodChange={handleFoodChange}
              onNutritionPhotoUpload={handleNutritionPhotoUpload}
              onIngredientsPhotoUpload={handleIngredientsPhotoUpload}
              onPricePhotoUpload={handlePricePhotoUpload}
              onPriceOnlyPhotoUpload={handlePriceOnlyPhotoUpload}
              onFeedingPhotoUpload={handleFeedingPhotoUpload}
              onSaveFoodData={handleSaveFoodData}
              onResetFoodData={handleResetFoodData}
              analyzingNutrition={analyzingNutrition}
              analyzingIngredients={analyzingIngredients}
              analyzingPrice={analyzingPrice}
              analyzingPriceOnly={analyzingPriceOnly}
              analyzingFeeding={analyzingFeeding}
            />
              </div>

        <Button
          onClick={analyzeKibble}
          disabled={analyzing || analyzingNutrition || analyzingIngredients || analyzingPrice || analyzingPriceOnly || analyzingFeeding}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mt-6"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t.analyzing}
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5 mr-2" />
              {t.analyzeKibble}
            </>
          )}
        </Button>

        <AnalysisResults results={results} recallInfo={recallInfo} foodData={foodData} />

        <BottomCards
          t={t}
          suggestion={suggestion}
          setSuggestion={setSuggestion}
          submittingSuggestion={submittingSuggestion}
          onSuggestionSubmit={handleSuggestionSubmit}
          showQROptions={showQROptions}
          setShowQROptions={setShowQROptions}
          onDownloadQR={downloadQRCode}
          onCopyLink={copyLinkToClipboard}
          onShareEmail={shareViaEmail}
          onAnalyzeNew={() => {
            setFoodData({
              dogFood: '', recommendedFeeding: '', kcalKg: '', kcalCup: '',
              omega3: '', omega6: '', vitaminE: '', selenium: '', zinc: '',
              crudeProtein: '', crudeFat: '', crudeFiber: '', moisture: '',
              taurine: '', glucosamine: '', chondroitin: '',
              priceBag: '', bagWeight: '', ingredients: ''
            });
            setResults(null);
            setRecallInfo(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        </div>
        </div>
        );
        }