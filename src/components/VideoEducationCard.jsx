import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function VideoEducationCard({ t }) {
  return (
    <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
      <CardHeader>
        <CardTitle className="text-xl text-green-700">{t.rawFeedingTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => {
            window.open('https://www.youtube.com/playlist?list=PLbQ5YaICgTRKM4NK0tWeJFmrao7o81OsI', '_blank');
            base44.analytics.track({ eventName: "learn_raw_feeding_clicked" });
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
        >
          🥩 {t.learnRaw}
        </Button>
        <Button
          onClick={() => {
            window.open('https://www.youtube.com/playlist?list=PLbQ5YaICgTRIHo9bIcXEKU98np4epAVF8', '_blank');
            base44.analytics.track({ eventName: "paw_licking_question_clicked" });
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-base py-6"
        >
          🐾 {t.pawLicking}
        </Button>
        <Button
          onClick={() => {
            window.open('https://www.youtube.com/playlist?list=PLbQ5YaICgTRII52jk3XKqC0nlmAk6i6ra', '_blank');
            base44.analytics.track({ eventName: "nutritional_secrets_clicked" });
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-base py-6"
        >
          🔐 {t.nutritionalSecrets}
        </Button>
      </CardContent>
    </Card>
  );
}