import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from 'qrcode.react';

export default function BottomCards({
  t,
  suggestion,
  setSuggestion,
  submittingSuggestion,
  onSuggestionSubmit,
  showQROptions,
  setShowQROptions,
  onDownloadQR,
  onCopyLink,
  onShareEmail,
  onAnalyzeNew
}) {
  return (
    <>
      <Card className="mt-8">
        <CardContent className="pt-6">
          <Button
            onClick={onAnalyzeNew}
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
          >
            🐾 Analyze New Kibble
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">{t.appSuggestions}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="text"
            maxLength={100}
            placeholder={t.shareSuggestion}
            className="w-full"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
          />
          <Button
            onClick={onSuggestionSubmit}
            disabled={submittingSuggestion || !suggestion.trim()}
            className="w-full"
          >
            {submittingSuggestion ? t.sending : t.submitSuggestion}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 text-center">{t.shareApp}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity p-4 bg-white rounded-lg shadow-md"
              onClick={() => setShowQROptions(!showQROptions)}
            >
              <QRCodeSVG id="qr-code-svg" value={window.location.href} size={150} level="H" />
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">{t.clickToShare}</p>
            {showQROptions && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-blue-300 z-10">
                <div className="p-2 space-y-1">
                  <button onClick={onDownloadQR} className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors">📥 {t.downloadQR}</button>
                  <button onClick={onCopyLink} className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors">📋 {t.copyLink}</button>
                  <button onClick={onShareEmail} className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors">✉️ {t.shareEmail}</button>
                  <button onClick={() => setShowQROptions(false)} className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded transition-colors text-gray-600">✕ {t.cancel}</button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}