
import { Property, AuditQuestion, User, UserRole, StatusRule } from './types';

export const MOCK_USER: User = {
  id: 'sup_001',
  name: 'Alex Thompson',
  role: UserRole.SUPERVISOR,
  phone: '+15550123',
  assignedSquadIds: ['lonavala']
};

export const MOCK_ADMIN: User = {
  id: 'adm_001',
  name: 'Sarah Management',
  role: UserRole.ADMIN,
  phone: '+15559999',
  assignedSquadIds: [] 
};

export const PROPERTIES: Property[] = [
  { id: 'lonavala', name: 'Lonavala', city: 'Maharashtra' },
  { id: 'karjat', name: 'Karjat', city: 'Maharashtra' },
  { id: 'alibaug', name: 'Alibaug', city: 'Maharashtra' },
  { id: 'nashik', name: 'Nashik', city: 'Maharashtra' },
  { id: 'pune', name: 'Pune', city: 'Maharashtra' }
];

export const VENDOR_TYPES = [
  'In House Chef',
  'Stand Alone',
  'Delivery',
  'MG',
  'Facility Management'
];

export const DEFAULT_STATUS_RULES: StatusRule[] = [
  { id: 'sr1', status: 'Meal Package', isUtilized: true },
  { id: 'sr2', status: 'Vacant', isUtilized: false },
  { id: 'sr3', status: 'Villa Audit', isUtilized: true },
  { id: 'sr4', status: 'Owner Booking', isUtilized: true },
  { id: 'sr5', status: 'Dry Run', isUtilized: true },
  { id: 'sr6', status: 'Delight', isUtilized: true },
  { id: 'sr7', status: 'Chef Charges', isUtilized: true },
  { id: 'sr8', status: 'Loss of Pay', isUtilized: true },
  { id: 'sr9', status: 'Week Off', isUtilized: true },
  { id: 'sr10', status: 'PL', isUtilized: true }
];

export const AUDIT_QUESTIONS: AuditQuestion[] = [
  { id: 'q1', text: 'Is the spices powder used is of known brand (Everest, Badsha, Suhana)?' },
  { id: 'q2', text: 'Oil used for cooking is of known brand and made from sunflower (Soffala, Gemini, Sunny)?' },
  { id: 'q3', text: 'Amul butter is use for guest?' },
  { id: 'q4', text: 'Condiments :- Ketchup, Jam, Soya sauce, Pickle, Chilli sauce etc is of known brand (Kissan, Mapro, Nilon\'s, Chings, Surbhi)?' },
  { id: 'q5', text: 'Ice cream Served to the guest is of known brand (Amul, Kwality Walls, Hocco)?' },
  { id: 'q6', text: 'Is all the foods are kept covered?' },
  { id: 'q7', text: 'Is any material found to be infested/expired?' },
  { id: 'q8', text: 'Was the staff in full uniform?' }
];
