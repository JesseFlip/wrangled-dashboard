import React, { useState } from 'react';
import { Tabs, TabsContent } from "../ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Palette, 
  ShoppingCart, 
  CheckSquare, 
  Star,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "../ui/button";
import { useData } from "../../context/DataContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

// Sections
import { OverviewSection } from "../overview/OverviewSection";
import { GuestSection } from "../guests/GuestSection";
import { ScheduleSection } from "../schedule/ScheduleSection";
import { DecorSection } from "../decor/DecorSection";
import { ShoppingSection } from "../shopping/ShoppingSection";
import { PrepSection } from "../prep/PrepSection";
import { HonoreeSection } from "../honorees/HonoreeSection";

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resetData, exportData } = useData();

  useKeyboardShortcuts((tab) => setActiveTab(tab));

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "guests", label: "Guests", icon: Users },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "decor", label: "Decor", icon: Palette },
    { id: "shopping", label: "Shopping", icon: ShoppingCart },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "honorees", label: "Honorees", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="font-bold text-teal-800 text-lg">Triple B-Day Trio</h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className={`
        fixed inset-0 z-50 bg-white md:relative md:inset-auto md:w-64 md:flex md:flex-col md:border-r md:border-slate-200
        transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 hidden md:block">
          <h1 className="font-bold text-teal-800 text-xl tracking-tight">Triple Birthday Bash</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Dallas Planning Hub</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
              `}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-slate-500 text-xs" onClick={exportData}>
            <Settings className="w-3 h-3 mr-2" /> Export JSON
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-500 text-xs" onClick={() => {
             if(confirm("Are you sure you want to reset all data?")) resetData();
          }}>
            Reset Data
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-white/50 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
          <div className="absolute top-[-100px] left-[-100px] text-[500px] font-bold text-teal-900">3</div>
          <div className="absolute bottom-[-100px] right-[-100px] text-[500px] font-bold text-coral">3</div>
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-10">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="overview"><OverviewSection /></TabsContent>
            <TabsContent value="guests"><GuestSection /></TabsContent>
            <TabsContent value="schedule"><ScheduleSection /></TabsContent>
            <TabsContent value="decor"><DecorSection /></TabsContent>
            <TabsContent value="shopping"><ShoppingSection /></TabsContent>
            <TabsContent value="tasks"><PrepSection /></TabsContent>
            <TabsContent value="honorees"><HonoreeSection /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};
