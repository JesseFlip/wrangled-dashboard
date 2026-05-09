import React from 'react';
import { useData } from "../../context/DataContext";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import type { ScheduleStatus } from "../../types";
import { Clock, MapPin, Edit3 } from "lucide-react";
import { Button } from "../ui/button";

export const ScheduleSection: React.FC = () => {
  const { data } = useData();

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'tentative': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Day-Of Timeline</h2>
        <p className="text-sm text-slate-500">The sequence of events for the celebration</p>
      </div>

      <div className="relative pl-8 border-l-2 border-slate-200 space-y-12">
        {data.schedule.map((block, index) => (
          <div key={block.id} className="relative">
            <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${block.status === 'confirmed' ? 'bg-teal-500' : 'bg-slate-300'}`} />
            
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="min-w-[100px] pt-1">
                <span className="text-sm font-bold text-slate-900 block">{block.startTime}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{block.endTime}</span>
              </div>

              <Card className="flex-1 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-slate-900 text-lg">{block.title}</h3>
                    <Badge variant="outline" className={getStatusColor(block.status)}>
                      {block.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{block.location}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed">
                    {block.description}
                  </p>

                  {block.notes && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-2">
                      <Edit3 className="w-3 h-3 text-slate-400 shrink-0 mt-1" />
                      <p className="text-xs text-slate-600 italic">{block.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {index === data.schedule.length - 1 && (
              <div className="absolute top-5 -left-[32px] w-0.5 h-full bg-white" />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8 no-print">
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Clock className="w-4 h-4" /> Print Timeline
        </Button>
      </div>
    </div>
  );
};
