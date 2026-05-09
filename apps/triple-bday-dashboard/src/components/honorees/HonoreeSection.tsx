import React from 'react';
import { useData } from "../../context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Music, Beer, Heart, Palette } from "lucide-react";

export const HonoreeSection: React.FC = () => {
  const { data, updateHonoree } = useData();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">The Birthday Trio</h2>
        <p className="text-sm text-slate-500">Personalized details for the guests of honor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {data.honorees.map((honoree) => (
          <div key={honoree.guestId} className="space-y-4">
            <Card className="border-none shadow-xl overflow-hidden relative group">
              <div 
                className="absolute top-0 left-0 w-full h-2" 
                style={{ backgroundColor: honoree.signatureColor }}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform"
                    style={{ backgroundColor: honoree.signatureColor }}
                  >
                    {honoree.name.charAt(0)}
                  </div>
                  <Badge variant="outline" className="border-slate-100 text-slate-400">
                    Birthday Honoree
                  </Badge>
                </div>
                <CardTitle className="text-2xl mt-4 font-extrabold tracking-tight" style={{ color: honoree.signatureColor }}>
                  {honoree.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> Signature Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: honoree.signatureColor }} />
                    <code className="text-xs text-slate-500 font-mono">{honoree.signatureColor}</code>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Beer className="w-3 h-3" /> Signature Drink
                  </label>
                  <Input 
                    value={honoree.signatureDrink || ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHonoree({ ...honoree, signatureDrink: e.target.value })}
                    className="h-9 text-sm font-medium border-slate-100 focus-visible:ring-offset-0"
                    style={{ borderLeft: `3px solid ${honoree.signatureColor}` }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Music className="w-3 h-3" /> Playlist Contribution
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className={`w-2 h-2 rounded-full ${honoree.playlistContributed ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-xs font-medium text-slate-600">
                      {honoree.playlistContributed ? "Songs Collected" : "Pending (Need 5 songs)"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Heart className="w-3 h-3" /> Dedication
                  </label>
                  <textarea 
                    value={honoree.dedication || ""} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateHonoree({ ...honoree, dedication: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600 italic leading-relaxed min-h-[100px] focus:outline-none focus:ring-1 focus:ring-slate-200"
                    placeholder="Add a special note..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
