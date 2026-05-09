import React, { useState } from 'react';
import { useData } from "../../context/DataContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import type { ShoppingCategory } from "../../types";
import { ShoppingCart, Filter, DollarSign, Printer } from "lucide-react";

export const ShoppingSection: React.FC = () => {
  const { data, updateShoppingItem } = useData();
  const [hidePurchased, setHidePurchased] = useState(false);

  const categories: ShoppingCategory[] = ['food', 'drinks', 'decor', 'logistics', 'print'];
  
  const categoryLabels: Record<ShoppingCategory, string> = {
    food: "Food & Ingredients",
    drinks: "Drinks & Spirits",
    decor: "Decoration Items",
    logistics: "Party Logistics",
    print: "Print at Home/FedEx"
  };

  const filteredItems = data.shopping.filter(item => 
    hidePurchased ? !item.purchased : true
  );

  const totalEstimated = data.shopping.reduce((acc, item) => acc + (item.estimatedCost || 0), 0);
  const purchasedTotal = data.shopping.filter(s => s.purchased).reduce((acc, item) => acc + (item.estimatedCost || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Shopping List</h2>
          <p className="text-sm text-slate-500">Track supplies and costs</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={hidePurchased ? "default" : "outline"} 
            className={`gap-2 ${hidePurchased ? 'bg-teal-600 text-white' : ''}`}
            onClick={() => setHidePurchased(!hidePurchased)}
          >
            <Filter className="w-4 h-4" /> Unpurchased Only
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Total</p>
              <p className="text-xl font-bold text-slate-900">${totalEstimated.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Remaining</p>
            <p className="text-xl font-bold text-teal-600">${(totalEstimated - purchasedTotal).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><ShoppingCart className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Items Purchased</p>
            <p className="text-xl font-bold text-slate-900">
              {data.shopping.filter(s => s.purchased).length} / {data.shopping.length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map(cat => {
          const items = filteredItems.filter(i => i.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className={`w-2 h-2 rounded-full ${cat === 'food' ? 'bg-coral' : cat === 'drinks' ? 'bg-teal-500' : 'bg-mustard'}`} />
                {categoryLabels[cat]}
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Item</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Qty</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Store</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Est. Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className={`${item.purchased ? 'opacity-50 grayscale' : ''}`}>
                        <TableCell>
                          <Checkbox 
                            checked={item.purchased} 
                            onCheckedChange={(checked: boolean) => updateShoppingItem({ ...item, purchased: !!checked })}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                          {item.assignedTo && <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">{item.assignedTo}</span>}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-slate-500 text-sm">{item.store || "-"}</TableCell>
                        <TableCell className="text-right text-sm font-mono">${(item.estimatedCost || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
