import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DashboardData, Guest, Honoree, ScheduleBlock, ShoppingItem, PrepTask, DecorIdea } from '../types';
import { SEED_DATA } from '../data/seed';
import { toast } from 'sonner';

interface DataContextType {
  data: DashboardData;
  updateGuest: (guest: Guest) => void;
  updateHonoree: (honoree: Honoree) => void;
  updateScheduleBlock: (block: ScheduleBlock) => void;
  updateShoppingItem: (item: ShoppingItem) => void;
  updateTask: (task: PrepTask) => void;
  updateDecorIdea: (idea: DecorIdea) => void;
  resetData: () => void;
  exportData: () => void;
  importData: (jsonData: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'triple-bday-dashboard-v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DashboardData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : SEED_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateGuest = (guest: Guest) => {
    setData(prev => ({
      ...prev,
      guests: prev.guests.map(g => g.id === guest.id ? guest : g)
    }));
    toast.success(`Updated guest: ${guest.name}`);
  };

  const updateHonoree = (honoree: Honoree) => {
    setData(prev => ({
      ...prev,
      honorees: prev.honorees.map(h => h.guestId === honoree.guestId ? honoree : h)
    }));
    toast.success(`Updated honoree: ${honoree.name}`);
  };

  const updateScheduleBlock = (block: ScheduleBlock) => {
    setData(prev => ({
      ...prev,
      schedule: prev.schedule.map(s => s.id === block.id ? block : s)
    }));
    toast.success(`Updated schedule: ${block.title}`);
  };

  const updateShoppingItem = (item: ShoppingItem) => {
    setData(prev => ({
      ...prev,
      shopping: prev.shopping.map(s => s.id === item.id ? item : s)
    }));
    toast.success(`Updated item: ${item.name}`);
  };

  const updateTask = (task: PrepTask) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? task : t)
    }));
    toast.success(`Updated task: ${task.title}`);
  };

  const updateDecorIdea = (idea: DecorIdea) => {
    setData(prev => ({
      ...prev,
      decor: prev.decor.map(d => d.id === idea.id ? idea : d)
    }));
    toast.success(`Updated decor: ${idea.description}`);
  };

  const resetData = () => {
    setData(SEED_DATA);
    toast.info("Data reset to seed values");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triple-bday-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setData(parsed);
      toast.success("Data imported successfully");
    } catch (e) {
      toast.error("Failed to import data");
      console.error(e);
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      updateGuest,
      updateHonoree,
      updateScheduleBlock,
      updateShoppingItem,
      updateTask,
      updateDecorIdea,
      resetData,
      exportData,
      importData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
