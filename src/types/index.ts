export type Language = 'en' | 'te' | 'hi';

export type UserRole = 'farmer' | 'staff' | 'admin' | 'centre_staff';

export type StaffStatus = 'pending_approval' | 'approved' | 'rejected' | 'removed';
export type AdminStatus = 'pending_approval' | 'approved' | 'rejected' | 'removed';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'staff' | 'admin';
  status?: string;
  centreId?: string;
  createdAt?: string;
  address?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  preferredLanguage?: string;
  farmerId?: string;
  landDetails?: string;
  mainCrop?: string;
  passwordHash?: string;
}

export interface StaffProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  employeeCode: string;
  centreId: string;
  centreName: string;
  designation?: string;
  role: 'staff';
  status: StaffStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  passwordHash?: string;
}

export interface AdminProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin';
  status?: AdminStatus;
  department?: string;
  designation?: string;
  isApexAdmin?: boolean;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  lastLoginAt?: string;
  passwordHash?: string;
}

export interface RegisterAdminData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  department?: string;
  designation?: string;
}

export interface OTPVerification {
  id?: string;
  email: string;
  otp: string;
  expiresAt: string;
  purpose: 'user_signup' | 'staff_login' | 'user_login' | 'staff_signup' | 'admin_login' | string;
  used: boolean;
  createdAt: string;
}

export interface CropInfo {
  id: string;
  name: string;
  nameTe: string;
  nameHi: string;
  mspPerQuintal: number;
  grade: string;
  maxMoistureAllowed: number;
  icon: string;
  description: string;
}

export interface ProcurementCentre {
  id: string;
  name: string;
  district: string;
  mandal: string;
  distanceKm: number;
  currentQueue: number;
  dailyCapacity: number;
  todayBookings: number;
  avgWaitMinutes: number;
  status: 'Open' | 'Crowded' | 'Full' | 'Closed';
  countersActive: number;
  address: string;
  contactNumber: string;
  isRecommended?: boolean;
}

export interface QueueItem {
  token: string;
  farmerName: string;
  crop: string;
  quantityQuintals: number;
  status: 'completed' | 'serving' | 'waiting' | 'held' | 'skipped';
  counter?: string;
  estimatedWaitMinutes: number;
  isCurrentUser?: boolean;
  arrivalTime?: string;
  timeSlot?: string;
}

export interface Booking {
  id: string;
  token: string;
  farmerName: string;
  farmerMobile: string;
  crop: string;
  quantityQuintals: number;
  centreId: string;
  centreName: string;
  date: string;
  timeSlot: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'rescheduled' | 'cancelled';
  createdAt: string;
  counterAssigned?: string;
  estimatedWaitMinutes?: number;
}

export interface ProcurementStep {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  icon: string;
}

export interface ProcurementDetails {
  bookingId: string;
  token: string;
  farmerName: string;
  crop: string;
  expectedQuantity: number;
  actualProcuredQuantity: number;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  moisturePercentage: number;
  maxAllowedMoisture: number;
  foreignMatterPercentage: number;
  qualityStatus: 'Accepted' | 'Under Inspection' | 'Conditional' | 'Rejected';
  expectedAmount: number;
  procuredAmount: number;
  weighbridgeSlipId: string;
  inspectingOfficer: string;
  centreName: string;
  currentStepIndex: number;
  steps: ProcurementStep[];
}

export interface PaymentDetails {
  bookingId: string;
  token: string;
  farmerName: string;
  crop: string;
  quantityQuintals: number;
  amount: number;
  status: 'Processing' | 'Initiated' | 'Credited' | 'Failed';
  pfmsReference: string;
  utrNumber?: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  procurementDate: string;
  expectedCreditDate: string;
  paymentSteps: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'queue' | 'procurement' | 'payment' | 'demand' | 'system' | 'weather';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface FarmerProfile {
  name: string;
  mobile: string;
  maskedAadhaar: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  landAcres: number;
  surveyPassbookNo: string;
  primaryCrops: string[];
  preferredLanguage: Language;
  bankName: string;
  bankAccountMasked: string;
  ifscCode: string;
  farmerRegistrationId: string;
  bankDetails?: {
    bankName: string;
    accountNumberMasked: string;
    ifsc: string;
  };
}

export interface Feedback {
  id: string;
  farmerUid: string;
  farmerName: string;
  centreId?: string;
  centreName?: string;
  rating: number;
  comment: string;
  category?: string;
  createdAt: string;
}
