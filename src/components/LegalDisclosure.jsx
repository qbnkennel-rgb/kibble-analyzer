import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalDisclosure({ onAccept }) {
  const [language, setLanguage] = useState('en');
  const translations = {
    en: {
      title: "LEGAL DISCLAIMER AND TERMS OF USE",
      legalDisclaimer: "LEGAL DISCLAIMER",
      legalText1: "This application (the \"App\") is provided for informational purposes only and is not intended to be a substitute for professional veterinary advice, diagnosis, or treatment. The analyses, recommendations, and information provided by this App are based on general nutritional data and algorithms and should not be considered as professional veterinary or nutritional consultation.",
      legalText2: "BY USING THIS APP, YOU ACKNOWLEDGE AND AGREE:",
      legalList1: "Not a Substitute for Veterinary Care: The App does not provide medical advice. Always seek the advice of your veterinarian or other qualified animal health provider with any questions you may have regarding your dog's health, nutrition, or medical condition. Never disregard professional veterinary advice or delay in seeking it because of information you have read on this App.",
      legalList2: "No Veterinarian-Client-Patient Relationship: Use of this App does not create a veterinarian-client-patient relationship between you, your dog, and any veterinarian or the App developers.",
      legalList3: "Accuracy of Information: While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained in the App. Nutritional data, ingredient analyses, and health scores are estimates based on available information and may not reflect the actual nutritional content or health impact of any specific dog food product.",
      legalList4: "Individual Dog Needs: Every dog is unique. Factors such as breed, age, weight, activity level, health conditions, and individual sensitivities can significantly affect nutritional needs and food tolerances. The App's recommendations may not be suitable for your specific dog.",
      legalList5: "Third-Party Information: The App may include links to third-party websites or references to third-party products. We do not endorse or assume any responsibility for the content, policies, or practices of any third-party sites or products.",
      legalList6: "Limitation of Liability: To the fullest extent permitted by law, the App developers, owners, and contributors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to or use of the App, including any damages resulting from reliance on information provided by the App.",
      legalList7: "User-Generated Data: Any information you input into the App is your responsibility to ensure accuracy. Incorrect data may lead to inaccurate analyses and recommendations.",
      legalList8: "Changes to Dog Food Products: Manufacturers may change product formulations without notice. The information in the App may not reflect the most current product specifications.",
      termsOfUse: "TERMS OF USE",
      termsText1: "By accessing and using this App, you agree to be bound by these Terms of Use and our Legal Disclaimer. If you do not agree with any part of these terms, you must not use this App.",
      termsText2: "You agree to:",
      termsList1: "Use the App at your own risk and discretion",
      termsList2: "Not rely solely on the App for decisions regarding your dog's health and nutrition",
      termsList3: "Consult with a licensed veterinarian before making any significant changes to your dog's diet",
      termsList4: "Verify all information and recommendations with qualified professionals",
      termsList5: "Accept full responsibility for any decisions you make based on information from the App",
      acknowledgment: "ACKNOWLEDGMENT",
      acknowledgmentText: "By clicking \"I Agree\" below, you acknowledge that you have read, understood, and agree to be bound by this Legal Disclaimer and Terms of Use. You further acknowledge that you will consult with a qualified veterinarian regarding your dog's specific nutritional needs and health concerns.",
      importantNote: "IMPORTANT: Please read this document carefully. Scroll to the bottom to continue.",
      agreeButton: "I Agree - Continue to App",
      scrollToEnable: "(Scroll to bottom to enable)",
      emergencyNote: "EMERGENCY NOTE",
      emergencyText: "If your dog is experiencing a medical emergency, close this app immediately and contact your veterinarian or emergency animal hospital."
    },
    es: {
      title: "DESCARGO DE RESPONSABILIDAD LEGAL Y TÉRMINOS DE USO",
      legalDisclaimer: "DESCARGO DE RESPONSABILIDAD LEGAL",
      legalText1: "Esta aplicación (la \"App\") se proporciona únicamente con fines informativos y no pretende sustituir el consejo, diagnóstico o tratamiento veterinario profesional. Los análisis, recomendaciones e información proporcionados por esta App se basan en datos nutricionales generales y algoritmos y no deben considerarse como consulta veterinaria o nutricional profesional.",
      legalText2: "AL USAR ESTA APP, USTED RECONOCE Y ACEPTA:",
      legalList1: "No es un Sustituto del Cuidado Veterinario: La App no proporciona consejo médico. Siempre busque el consejo de su veterinario u otro proveedor calificado de salud animal con cualquier pregunta que pueda tener sobre la salud, nutrición o condición médica de su perro. Nunca ignore el consejo veterinario profesional ni demore en buscarlo debido a la información que haya leído en esta App.",
      legalList2: "No Hay Relación Veterinario-Cliente-Paciente: El uso de esta App no crea una relación veterinario-cliente-paciente entre usted, su perro y ningún veterinario o los desarrolladores de la App.",
      legalList3: "Precisión de la Información: Si bien nos esforzamos por proporcionar información precisa y actualizada, no hacemos representaciones ni garantías de ningún tipo, expresas o implícitas, sobre la integridad, precisión, confiabilidad, idoneidad o disponibilidad de la información contenida en la App. Los datos nutricionales, análisis de ingredientes y puntajes de salud son estimaciones basadas en información disponible y pueden no reflejar el contenido nutricional real o el impacto en la salud de ningún producto alimenticio específico para perros.",
      legalList4: "Necesidades Individuales del Perro: Cada perro es único. Factores como raza, edad, peso, nivel de actividad, condiciones de salud y sensibilidades individuales pueden afectar significativamente las necesidades nutricionales y tolerancias alimentarias. Las recomendaciones de la App pueden no ser adecuadas para su perro específico.",
      legalList5: "Información de Terceros: La App puede incluir enlaces a sitios web de terceros o referencias a productos de terceros. No respaldamos ni asumimos ninguna responsabilidad por el contenido, políticas o prácticas de ningún sitio o producto de terceros.",
      legalList6: "Limitación de Responsabilidad: En la mayor medida permitida por la ley, los desarrolladores, propietarios y colaboradores de la App no serán responsables de ningún daño directo, indirecto, incidental, consecuente o punitivo que surja de su acceso o uso de la App, incluidos los daños resultantes de la confianza en la información proporcionada por la App.",
      legalList7: "Datos Generados por el Usuario: Cualquier información que ingrese en la App es su responsabilidad garantizar la precisión. Los datos incorrectos pueden conducir a análisis y recomendaciones inexactos.",
      legalList8: "Cambios en los Productos de Alimentos para Perros: Los fabricantes pueden cambiar las formulaciones de productos sin previo aviso. La información en la App puede no reflejar las especificaciones de producto más actuales.",
      termsOfUse: "TÉRMINOS DE USO",
      termsText1: "Al acceder y usar esta App, usted acepta estar sujeto a estos Términos de Uso y nuestro Descargo de Responsabilidad Legal. Si no está de acuerdo con alguna parte de estos términos, no debe usar esta App.",
      termsText2: "Usted acepta:",
      termsList1: "Usar la App bajo su propio riesgo y discreción",
      termsList2: "No confiar únicamente en la App para decisiones sobre la salud y nutrición de su perro",
      termsList3: "Consultar con un veterinario licenciado antes de hacer cambios significativos en la dieta de su perro",
      termsList4: "Verificar toda la información y recomendaciones con profesionales calificados",
      termsList5: "Aceptar la responsabilidad total de cualquier decisión que tome basada en información de la App",
      acknowledgment: "RECONOCIMIENTO",
      acknowledgmentText: "Al hacer clic en \"Acepto\" a continuación, usted reconoce que ha leído, entendido y acepta estar sujeto a este Descargo de Responsabilidad Legal y Términos de Uso. Además, reconoce que consultará con un veterinario calificado sobre las necesidades nutricionales específicas y preocupaciones de salud de su perro.",
      importantNote: "IMPORTANTE: Por favor lea este documento cuidadosamente. Desplácese hasta el final para continuar.",
      agreeButton: "Acepto - Continuar a la App",
      scrollToEnable: "(Desplácese hasta el final para habilitar)",
      emergencyNote: "NOTA DE EMERGENCIA",
      emergencyText: "Si su perro está experimentando una emergencia médica, cierre esta aplicación inmediatamente y contacte a su veterinario u hospital de animales de emergencia."
    }
  };

  const t = translations[language];
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef(null);

  const handleScroll = (e) => {
    const element = e.target;
    const bottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 5;
    if (bottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={language === 'es' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('es')}
            >
              Español
            </Button>
          </div>
          <CardTitle className="text-2xl text-center text-red-600">
            ⚠️ {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50 max-h-[60vh]"
          >
            <div className="space-y-4 text-sm text-gray-800">
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <h3 className="font-bold text-lg text-yellow-800 mb-2">⚠️ {t.emergencyNote}</h3>
                <p className="text-yellow-900">
                  {t.emergencyText}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xl mb-3 text-red-700">{t.legalDisclaimer}</h3>
                <p className="mb-4 leading-relaxed">
                  {t.legalText1}
                </p>
                
                <p className="font-semibold mb-2">{t.legalText2}</p>
                
                <ol className="list-decimal list-inside space-y-3 ml-4">
                  <li className="leading-relaxed">{t.legalList1}</li>
                  <li className="leading-relaxed">{t.legalList2}</li>
                  <li className="leading-relaxed">{t.legalList3}</li>
                  <li className="leading-relaxed">{t.legalList4}</li>
                  <li className="leading-relaxed">{t.legalList5}</li>
                  <li className="leading-relaxed">{t.legalList6}</li>
                  <li className="leading-relaxed">{t.legalList7}</li>
                  <li className="leading-relaxed">{t.legalList8}</li>
                </ol>
              </div>

              <div className="border-t-2 border-gray-300 pt-4">
                <h3 className="font-bold text-xl mb-3 text-red-700">{t.termsOfUse}</h3>
                <p className="mb-4 leading-relaxed">{t.termsText1}</p>
                <p className="font-semibold mb-2">{t.termsText2}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t.termsList1}</li>
                  <li>{t.termsList2}</li>
                  <li>{t.termsList3}</li>
                  <li>{t.termsList4}</li>
                  <li>{t.termsList5}</li>
                </ul>
              </div>

              <div className="border-t-2 border-gray-300 pt-4">
                <h3 className="font-bold text-xl mb-3 text-red-700">{t.acknowledgment}</h3>
                <p className="leading-relaxed">{t.acknowledgmentText}</p>
              </div>

              <div className="h-8"></div>
            </div>
          </div>

          {!hasScrolledToBottom && (
            <p className="text-sm text-orange-600 font-semibold text-center mb-2">
              {t.scrollToEnable}
            </p>
          )}

          <Button
            onClick={onAccept}
            disabled={!hasScrolledToBottom}
            className={`w-full ${hasScrolledToBottom ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
          >
            {t.agreeButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}