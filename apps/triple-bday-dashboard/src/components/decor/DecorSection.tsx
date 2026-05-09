import React, { useState } from 'react';
import { useData } from "../../context/DataContext";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import type { DecorArea, DecorStatus } from "../../types";
import { Palette, Printer, Layout } from "lucide-react";
import { Button } from "../ui/button";

export const DecorSection: React.FC = () => {
  const { data } = useData();
  const [filterPrint, setFilterPrint] = useState(false);

  const areas: DecorArea[] = ['entry', 'hotpotTable', 'photoWall', 'led', 'wyattCorner'];
  
  const areaLabels: Record<DecorArea, string> = {
    entry: "Entry & Welcome",
    hotpotTable: "Hot Pot Table",
    photoWall: "Photo Wall",
    led: "WrangLED",
    wyattCorner: "Wyatt's Corner"
  };

  const getStatusBadge = (status: DecorStatus) => {
    switch (status) {
      case 'done': return <Badge className="bg-green-500">Done</Badge>;
      case 'planned': return <Badge className="bg-teal-500">Planned</Badge>;
      default: return <Badge variant="outline" className="text-slate-400">Idea</Badge>;
    }
  };

  const printItems = data.shopping.filter(item => item.category === 'print').map(item => item.name.toLowerCase());

  const filteredDecor = data.decor.filter(idea => {
    if (!filterPrint) return true;
    return printItems.some(p => idea.description.toLowerCase().includes(p)) || 
           ['ingredient cards', 'labels', 'sign', 'cards'].some(keyword => idea.description.toLowerCase().includes(keyword));
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Decoration Plan</h2>
          <p className="text-sm text-slate-500">Visual atmosphere and setup areas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterPrint ? "default" : "outline"} 
            className={`gap-2 ${filterPrint ? 'bg-mustard text-teal-900 hover:bg-mustard/90 border-none' : ''}`}
            onClick={() => setFilterPrint(!filterPrint)}
          >
            <Printer className="w-4 h-4" /> Print Queue
          </Button>
          <Button className="bg-teal-600 gap-2">
            <Palette className="w-4 h-4" /> Add Idea
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {areas.map(area => {
          const items = filteredDecor.filter(d => d.area === area);
          if (items.length === 0 && filterPrint) return null;

          return (
            <div key={area} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layout className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-800 tracking-tight uppercase text-xs">{areaLabels[area]}</h3>
                <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              
              <div className="space-y-3">
                {items.length > 0 ? items.map((item) => (
                  <Card key={item.id} className="border-slate-200 shadow-sm overflow-hidden group">
                    {item.imageUrl && (
                      <div className="h-32 bg-slate-100 relative overflow-hidden">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{item.description}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      {(printItems.some(p => item.description.toLowerCase().includes(p)) || 
                        ['cards', 'labels', 'sign'].some(k => item.description.toLowerCase().includes(k))) && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          <Printer className="w-3 h-3" /> Needs Printing
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400 italic">No items yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
