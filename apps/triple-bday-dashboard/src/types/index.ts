export type GuestRole = 'honoree' | 'active' | 'other';
export type RSVPStatus = 'pending' | 'yes' | 'no' | 'maybe';

export interface Guest {
  id: string;
  name: string;
  role: GuestRole;
  rsvpStatus: RSVPStatus;
  partner?: string;
  dietaryNotes?: string;
  bringingItems?: string[];
}

export interface Honoree {
  guestId: string;
  signatureColor: string;
  signatureDrink?: string;
  playlistContributed: boolean;
  name: string;
  imageUrl?: string;
  dedication?: string;
}

export type ScheduleStatus = 'planned' | 'confirmed' | 'tentative';

export interface ScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  location: string;
  description: string;
  status: ScheduleStatus;
  notes?: string;
}

export type ShoppingCategory = 'decor' | 'food' | 'drinks' | 'logistics' | 'print';

export interface ShoppingItem {
  id: string;
  category: ShoppingCategory;
  name: string;
  quantity: string;
  store?: string;
  estimatedCost?: number;
  purchased: boolean;
  assignedTo?: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface PrepTask {
  id: string;
  title: string;
  dueDate: string;
  owner: string;
  status: TaskStatus;
  notes?: string;
}

export type DecorStatus = 'idea' | 'planned' | 'done';
export type DecorArea = 'entry' | 'hotpotTable' | 'photoWall' | 'led' | 'wyattCorner';

export interface DecorIdea {
  id: string;
  area: DecorArea;
  description: string;
  status: DecorStatus;
  imageUrl?: string;
}

export interface DashboardData {
  guests: Guest[];
  honorees: Honoree[];
  schedule: ScheduleBlock[];
  shopping: ShoppingItem[];
  tasks: PrepTask[];
  decor: DecorIdea[];
}
