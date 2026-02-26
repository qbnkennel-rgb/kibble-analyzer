import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DogInfoCard({
  dogData,
  savedDogs,
  showNewDogInput,
  language,
  t,
  onDogChange,
  onSaveNewDog,
  onDeleteDog,
  onLoadDog,
  setShowNewDogInput,
  setLanguage,
  setDogData
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-blue-600">{t.dogInfo}</CardTitle>
          <div className="flex gap-2">
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
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>{t.dogName}</Label>
          {showNewDogInput ? (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={language === 'en' ? "Enter new dog name..." : "Ingresa nuevo nombre del perro..."}
                value={dogData.dogName}
                onChange={(e) => onDogChange('dogName', e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={onSaveNewDog}
                  disabled={!dogData.dogName}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {t.save}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewDogInput(false);
                    onDogChange('dogName', '');
                  }}
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Select
                value={dogData.dogName}
                onValueChange={(val) => {
                  if (val === '_add_new_') {
                    setShowNewDogInput(true);
                    setDogData({
                      dogName: '',
                      dogSize: 'medium',
                      dogWeight: '',
                      activityLevel: 'neutered adult',
                      dogFoodGoal: 'anti-yeast',
                      zipCode: '',
                      ageYears: '',
                      ageMonths: ''
                    });
                  } else {
                    onDogChange('dogName', val);
                    onLoadDog(val);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectDog} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_add_new_">{t.addNewDog}</SelectItem>
                  {savedDogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.name}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dogData.dogName && (
                <Button
                  onClick={onDeleteDog}
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete {dogData.dogName}
                </Button>
              )}
            </div>
          )}
        </div>

        <div>
          <Label>{t.dogSize}</Label>
          <Select value={dogData.dogSize} onValueChange={(val) => onDogChange('dogSize', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toy">{t.toy}</SelectItem>
              <SelectItem value="small">{t.small}</SelectItem>
              <SelectItem value="medium">{t.medium}</SelectItem>
              <SelectItem value="large">{t.large}</SelectItem>
              <SelectItem value="x-large">{t.xLarge}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t.dogWeight}</Label>
          <Input
            type="number"
            placeholder={language === 'en' ? "e.g., 50" : "ej., 50"}
            value={dogData.dogWeight}
            onChange={(e) => onDogChange('dogWeight', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.activityLevel}</Label>
          <Select value={dogData.activityLevel} onValueChange={(val) => onDogChange('activityLevel', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inactive/senior">{t.inactiveSenior}</SelectItem>
              <SelectItem value="neutered adult">{t.neuteredAdult}</SelectItem>
              <SelectItem value="active/intact adult">{t.activeIntact}</SelectItem>
              <SelectItem value="highly active/working">{t.highlyActive}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t.dogFoodGoal}</Label>
          <Select value={dogData.dogFoodGoal} onValueChange={(val) => onDogChange('dogFoodGoal', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anti-yeast">{t.antiYeast}</SelectItem>
              <SelectItem value="overall health">{t.overallHealth}</SelectItem>
              <SelectItem value="allergies">{t.allergies}</SelectItem>
              <SelectItem value="skin/coat health">{t.skinCoat}</SelectItem>
              <SelectItem value="heart health">{t.heartHealth}</SelectItem>
              <SelectItem value="joint health">{t.jointHealth}</SelectItem>
              <SelectItem value="reproduction">{t.reproduction}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t.zipCode}</Label>
          <Input
            type="text"
            placeholder={language === 'en' ? "e.g., 77328" : "ej., 77328"}
            value={dogData.zipCode}
            onChange={(e) => onDogChange('zipCode', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.ageYears}</Label>
          <Input
            type="number"
            placeholder={t.optional}
            value={dogData.ageYears}
            onChange={(e) => onDogChange('ageYears', e.target.value)}
          />
        </div>

        <div>
          <Label>{t.ageMonths}</Label>
          <Input
            type="number"
            placeholder={t.optional}
            value={dogData.ageMonths}
            onChange={(e) => onDogChange('ageMonths', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}