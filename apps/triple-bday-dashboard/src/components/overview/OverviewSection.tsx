import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useData } from "../../context/DataContext";
import { Users, Calendar, ShoppingCart, CheckSquare, Music } from "lucide-react";

export const OverviewSection: React.FC = () => {
  const { data } = useData();
  const [countdown, setCountdown] = useState("");

  const targetDate = new Date("2026-06-10T17:00:00");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown("It's Party Time!");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      
      setCountdown(`${days}d ${hours}h ${mins}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = {
    rsvps: data.guests.filter(g => g.rsvpStatus === 'yes').length,
    totalGuests: data.guests.length,
    tasksDone: data.tasks.filter(t => t.status === 'done').length,
    totalTasks: data.tasks.length,
    itemsBought: data.shopping.filter(s => s.purchased).length,
    totalItems: data.shopping.length,
  };

  const nextTasks = data.tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-teal-900 tracking-tight">The Big Three</h2>
          <p className="text-slate-500 mt-2 text-lg">Triple Birthday Celebration & Hot Pot Dinner</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-teal-100 shadow-sm flex items-center gap-4">
          <Calendar className="text-teal-600 w-5 h-5" />
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Countdown</p>
            <p className="text-xl font-mono font-bold text-teal-700">{countdown}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.honorees.map((honoree) => (
          <Card key={honoree.guestId} className="overflow-hidden border-none shadow-lg relative group transition-all hover:scale-[1.02]">
            <div 
              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" 
              style={{ backgroundColor: honoree.signatureColor }}
            />
            <CardHeader className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center text-xl font-bold text-slate-400">
                  {honoree.name.charAt(0)}
                </div>
                <Badge 
                  variant="outline" 
                  className="border-none text-white px-3 py-1"
                  style={{ backgroundColor: honoree.signatureColor }}
                >
                  Honoree
                </Badge>
              </div>
              <CardTitle className="mt-4 text-2xl font-bold" style={{ color: honoree.signatureColor }}>
                {honoree.name}
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium italic">
                "{honoree.dedication}"
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 pt-0">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 rounded-lg bg-white shadow-sm"><Drink className="w-4 h-4 text-slate-400" /></div>
                <span>Drink: <strong>{honoree.signatureDrink}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 rounded-lg bg-white shadow-sm"><Music className="w-4 h-4 text-slate-400" /></div>
                <span>Playlist: <strong>{honoree.playlistContributed ? "Contributed" : "Pending"}</strong></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Event Progress</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Users className="w-3 h-3" /> RSVPs</span>
                <span className="font-bold">{stats.rsvps}/{stats.totalGuests}</span>
              </div>
              <Progress value={(stats.rsvps / stats.totalGuests) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><CheckSquare className="w-3 h-3" /> Prep Tasks</span>
                <span className="font-bold">{stats.tasksDone}/{stats.totalTasks}</span>
              </div>
              <Progress value={(stats.tasksDone / stats.totalTasks) * 100} className="h-2 bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><ShoppingCart className="w-3 h-3" /> Shopping</span>
                <span className="font-bold">{stats.itemsBought}/{stats.totalItems}</span>
              </div>
              <Progress value={(stats.itemsBought / stats.totalItems) * 100} className="h-2 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm border-l-4 border-l-mustard">
          <CardHeader>
            <CardTitle className="text-lg">Next 3 To-Dos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextTasks.length > 0 ? nextTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${task.status === 'doing' ? 'bg-mustard animate-pulse' : 'bg-slate-300'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{task.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Due {task.dueDate}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 italic text-center py-4">All caught up!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Drink = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m11 2-2 3"/><path d="M19 14h-1a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M15 11h-1a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3"/><path d="M5 22h14"/><path d="M7 22v-7a2 2 0 0 1 2-2h1"/><path d="M9 13v-3a2 2 0 0 1 2-2h1"/></svg>
);
