export enum UserRole {
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  assignedSquadIds?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  squadId: string;
  vendorType: string;
  numberOfTeams: number;
}

export interface Property {
  id: string;
  name: string;
  city: string;
}

export interface AuditQuestion {
  id: string;
  text: string;
}

export interface AuditResponse {
  questionId: string;
  answer: boolean;
  photoUrl?: string;
  photoMetadata?: {
    timestamp: string;
    lat: number;
    lng: number;
  };
}

export interface Audit {
  id: string;
  bookingId: string;
  propertyId: string;
  supervisorId: string;
  vendorName: string;
  datetime: string;
  lat: number;
  lng: number;
  status: 'DRAFT' | 'SUBMITTED';
  responses: AuditResponse[];
  complianceScore: number;
  activeTeamsCount?: number;
}

export interface StatusRule {
  id: string;
  status: string;
  isUtilized: boolean;
}

export interface VendorAllocation {
  id: string;
  vendorId: string;
  squadId: string;
  supervisorId: string;
  date: string;
  type: string;
  timestamp: string;
}

export interface TrainingPhoto {
  url: string;
  timestamp: string;
  lat: number;
  lng: number;
}

export interface Training {
  id: string;
  squadId: string;
  supervisorId: string;
  trainingName: string;
  attendees: string;
  date: string;
  photos: TrainingPhoto[];
  status: 'PENDING' | 'COMPLETED';
}

export interface VillaAudit {
  id: string;
  propertyName: string;
  akaName: string;
  squadId: string;
  vistaShare: string;
  ownerShare: string;
  pocName: string;
  pocContact: string;
  supervisorId: string;
  status: 'PENDING' | 'COMPLETED';
  dateAssigned: string;
  serviceType?: 'COOKING' | 'DELIVERY';
  inventoryFileUrl?: string;
  inventoryFileName?: string;
  kitchenPhotos?: string[];
  completionDate?: string;
}

// NEW: Vendor Audit Post
export interface VendorAuditPost {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  photos: string[]; // base64 data URLs
  createdAt: string;
  squadId?: string;
}

// ── Chef Villa Audit (room-by-room with photos) ──────────────────────────────
export interface ChecklistItem {
  item: string;
  checked: boolean;
}

export interface ChefRoomAudit {
  roomId: string;
  label: string;
  photos: string[];       // base64 data URLs
  notes: string;
  checklist: ChecklistItem[];
  completed: boolean;
}

export interface ChefVillaAuditRecord {
  id: string;
  chefId: string;
  chefName: string;
  propertyId: string;
  propertyName: string;
  roomAudits: ChefRoomAudit[];
  overallNotes: string;
  totalPhotos: number;
  completedRooms: number;
  lat: number;
  lng: number;
  submittedAt: string;
  status: 'SUBMITTED';
}
