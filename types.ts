
export enum UserRole {
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  assignedSquadIds?: string[]; // IDs of Properties/Squads the user is assigned to
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
  answer: boolean; // true for Yes, false for No
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
  propertyId: string; // Used for "Squad"
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
  date: string; // YYYY-MM-DD
  type: string; // Dynamic status name from StatusRule
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
  
  // Completion data
  serviceType?: 'COOKING' | 'DELIVERY';
  inventoryFileUrl?: string; // Mock for PDF
  inventoryFileName?: string;
  kitchenPhotos?: string[]; // Array of 3 photo URLs
  completionDate?: string;
}
