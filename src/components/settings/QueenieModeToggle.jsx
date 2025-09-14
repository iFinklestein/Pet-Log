import React from "react";
import { Heart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { appCopy } from "../utils/copy";

export default function QueenieModeToggle({ enabled, onToggle }) {
  return (
    <Card className={`transition-all duration-300 ${enabled ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${enabled ? 'text-pink-500' : 'text-gray-500'}`} />
          {appCopy.queenie.mode}
          {enabled && <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {appCopy.queenie.modeDescription}
            </p>
            {enabled && (
              <p className="text-sm text-pink-600 mt-2 font-medium">
                {appCopy.queenie.encouragement[Math.floor(Math.random() * appCopy.queenie.encouragement.length)]}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="queenie-mode"
              checked={enabled}
              onCheckedChange={onToggle}
            />
            <Label htmlFor="queenie-mode" className="sr-only">
              Toggle Queenie Mode
            </Label>
          </div>
        </div>
        
        {enabled && (
          <div className="mt-4 p-3 rounded-lg bg-pink-100 border border-pink-200">
            <div className="flex items-center gap-2 text-pink-700">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Queenie Mode Active!</span>
            </div>
            <p className="text-xs text-pink-600 mt-1">
              You'll now see encouraging messages and cute stickers throughout the app
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}