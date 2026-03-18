import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function FdaRecallCard({ t, foodData, checkingRecalls, onCheckRecalls }) {
  return (
    <Card className="mb-8 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
      <CardHeader>
        <CardTitle className="text-xl text-red-700 flex items-center gap-2">
          ⚠️ {t.fdaRecalls}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">{t.recallCheckerDesc}</p>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onCheckRecalls}
          disabled={checkingRecalls || !foodData.dogFood}
          className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
        >
          {checkingRecalls ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t.checkingRecalls}
            </>
          ) : (
            <>🔍 {t.checkRecalls}</>
          )}
        </Button>
        {!foodData.dogFood && (
          <p className="text-sm text-gray-600 mt-2 text-center">{t.enterFoodName}</p>
        )}
      </CardContent>
    </Card>
  );
}