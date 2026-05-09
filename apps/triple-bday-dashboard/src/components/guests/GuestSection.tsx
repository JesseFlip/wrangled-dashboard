import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useData } from "../../context/DataContext";
import type { Guest, RSVPStatus, GuestRole } from "../../types";
import { Copy, UserPlus, Info, Search } from "lucide-react";
import { toast } from "sonner";

export const GuestSection: React.FC = () => {
  const { data, updateGuest } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const filteredGuests = data.guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyInvite = () => {
    const text = `Hey! We're planning a Triple Birthday Party & Hot Pot Dinner for Jesse, Dorys, and our third mystery honoree! 🎂✨\n\nWhen: June 10th @ 1:00 PM\nWhere: Dallas, TX\n\nPlease let us know if you can make it! RSVP here: [Link]`;
    navigator.clipboard.writeText(text);
    toast.success("Invite message copied to clipboard!");
    setInviteModalOpen(false);
  };

  const getRSVPColor = (status: RSVPStatus) => {
    switch (status) {
      case 'yes': return 'bg-green-100 text-green-700 border-green-200';
      case 'maybe': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'no': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getRoleBadge = (role: GuestRole) => {
    if (role === 'honoree') return <Badge className="bg-coral text-white border-none">Honoree</Badge>;
    if (role === 'active') return <Badge variant="outline" className="text-teal-600 border-teal-200">Active Planner</Badge>;
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Guest List</h2>
          <p className="text-sm text-slate-500">Manage RSVPs and guest details</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={() => setInviteModalOpen(true)} variant="outline" className="gap-2">
            <Copy className="w-4 h-4" /> Copy Invite
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
            <UserPlus className="w-4 h-4" /> Add Guest
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search guests..." 
          className="flex-1 bg-transparent border-none outline-none text-sm p-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold hidden md:table-cell">Partner</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest) => (
              <TableRow key={guest.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedGuest(guest)}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${guest.role === 'honoree' ? 'bg-coral/20 text-coral' : 'bg-slate-100 text-slate-500'}`}>
                      {guest.name.charAt(0)}
                    </div>
                    {guest.name}
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(guest.role)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRSVPColor(guest.rsvpStatus)}>
                    {guest.rsvpStatus.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm hidden md:table-cell">{guest.partner || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-4 h-4 text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Guest Detail Modal */}
      <Dialog open={!!selectedGuest} onOpenChange={() => setSelectedGuest(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Guest Details</DialogTitle>
            <DialogDescription>
              View and edit info for {selectedGuest?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-xs font-bold text-slate-500 uppercase">Status</label>
              <select 
                className="col-span-3 bg-slate-50 border border-slate-200 rounded p-2 text-sm"
                value={selectedGuest?.rsvpStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => selectedGuest && updateGuest({ ...selectedGuest, rsvpStatus: e.target.value as RSVPStatus })}
              >
                <option value="pending">Pending</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-xs font-bold text-slate-500 uppercase">Partner</label>
              <Input 
                className="col-span-3 h-8" 
                value={selectedGuest?.partner || ""} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => selectedGuest && updateGuest({ ...selectedGuest, partner: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-xs font-bold text-slate-500 uppercase pt-2">Notes</label>
              <textarea 
                className="col-span-3 bg-slate-50 border border-slate-200 rounded p-2 text-sm min-h-[80px]"
                value={selectedGuest?.dietaryNotes || ""} 
                placeholder="Dietary restrictions, notes..."
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => selectedGuest && updateGuest({ ...selectedGuest, dietaryNotes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGuest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Message</DialogTitle>
            <DialogDescription>
              Copy this message to send to guests
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm whitespace-pre-wrap">
            {`Hey! We're planning a Triple Birthday Party & Hot Pot Dinner for Jesse, Dorys, and our third mystery honoree! 🎂✨\n\nWhen: June 10th @ 1:00 PM\nWhere: Dallas, TX\n\nPlease let us know if you can make it! RSVP here: [Link]`}
          </div>
          <DialogFooter>
            <Button className="w-full bg-teal-600" onClick={copyInvite}>Copy to Clipboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
