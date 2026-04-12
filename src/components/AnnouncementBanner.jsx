import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-md">
      <a
        href="https://nuvet.com/513237"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center text-sm font-semibold leading-snug hover:underline cursor-pointer"
        onClick={() => {
          if (window.base44?.analytics) {
            window.base44.analytics.track({ eventName: "announcement_banner_clicked" });
          }
        }}
      >
        🐾 In order To Improve Easty/Westy, Dog Skin Allergy or Skin Issues, Joints Issues and Help Improve your dog's Overall Health — <span className="underline font-bold">Click this Text to order Nuvet & NuJoint DS W/AutoShip So you Can get 15% Off</span> Easty/Westy, Dog Skin Allergy or Skin Issues, Joints Issues and Help Improve your dog's Overall Health — <span className="underline font-bold">Click this Text to order Nuvet & NuJoint DS W/AutoShip So you Can get 15% Off</span>
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}