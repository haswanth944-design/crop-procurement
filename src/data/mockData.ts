import { CropInfo, ProcurementCentre, QueueItem, Booking, ProcurementDetails, PaymentDetails, AppNotification, FarmerProfile } from '../types';

export const mockCrops: CropInfo[] = [
  {
    id: 'paddy',
    name: 'Paddy (Grade-A)',
    nameTe: 'వరి (గ్రేడ్-ఎ)',
    nameHi: 'धान (ग्रेड-ए)',
    mspPerQuintal: 2320,
    grade: 'Grade-A Fair Average Quality (FAQ)',
    maxMoistureAllowed: 17.0,
    icon: '🌾',
    description: 'Procured by FCI and State Civil Supplies Corp at guaranteed MSP.'
  },
  {
    id: 'wheat',
    name: 'Wheat',
    nameTe: 'గోధుమలు',
    nameHi: 'गेहूं',
    mspPerQuintal: 2275,
    grade: 'FAQ Standard',
    maxMoistureAllowed: 12.0,
    icon: '🌱',
    description: 'Rabi harvest standard grain procurement with immediate moisture screening.'
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    nameTe: 'మొక్కజొన్న',
    nameHi: 'मक्का',
    mspPerQuintal: 2090,
    grade: 'Feed & Food Grade FAQ',
    maxMoistureAllowed: 14.0,
    icon: '🌽',
    description: 'Procured for buffer stock and bio-fuel industrial processing.'
  },
  {
    id: 'cotton',
    name: 'Cotton (Medium Staple)',
    nameTe: 'పత్తి',
    nameHi: 'कपास',
    mspPerQuintal: 7121,
    grade: 'Medium Staple 24.5mm - 25.5mm',
    maxMoistureAllowed: 8.0,
    icon: '☁️',
    description: 'Cotton Corporation of India (CCI) certified direct farmer procurement.'
  },
  {
    id: 'groundnut',
    name: 'Groundnut (in shell)',
    nameTe: 'వేరుశనగ',
    nameHi: 'मूंगफली',
    mspPerQuintal: 6783,
    grade: 'Oilseed FAQ Grade',
    maxMoistureAllowed: 8.0,
    icon: '🥜',
    description: 'Nafed oilseed price support scheme (PSS) certified intake.'
  }
];

export const mockCentres: ProcurementCentre[] = [
  {
    id: 'centre-1',
    name: 'Mylavaram Procurement Centre',
    district: 'NTR District',
    mandal: 'Mylavaram',
    distanceKm: 2.4,
    currentQueue: 18,
    dailyCapacity: 100,
    todayBookings: 72,
    avgWaitMinutes: 35,
    status: 'Open',
    countersActive: 3,
    address: 'Near Agriculture Market Yard, Mylavaram - 521230',
    contactNumber: '+91 866 284 3110',
    isRecommended: false
  },
  {
    id: 'centre-2',
    name: 'Gollapudi Procurement Centre',
    district: 'NTR District',
    mandal: 'Vijayawada Rural',
    distanceKm: 6.8,
    currentQueue: 8,
    dailyCapacity: 120,
    todayBookings: 54,
    avgWaitMinutes: 22,
    status: 'Open',
    countersActive: 4,
    address: 'National Highway Bypass Road, Gollapudi - 521225',
    contactNumber: '+91 866 241 5590',
    isRecommended: true
  },
  {
    id: 'centre-3',
    name: 'Vijayawada Central APMC Yard',
    district: 'Krishna District',
    mandal: 'Vijayawada Urban',
    distanceKm: 14.2,
    currentQueue: 25,
    dailyCapacity: 150,
    todayBookings: 132,
    avgWaitMinutes: 48,
    status: 'Crowded',
    countersActive: 5,
    address: 'APMC Market Complex, Bhavanipuram, Vijayawada - 520012',
    contactNumber: '+91 866 243 0088',
    isRecommended: false
  },
  {
    id: 'centre-4',
    name: 'Ibrahimpatnam Grain Terminal',
    district: 'NTR District',
    mandal: 'Ibrahimpatnam',
    distanceKm: 18.5,
    currentQueue: 12,
    dailyCapacity: 90,
    todayBookings: 61,
    avgWaitMinutes: 28,
    status: 'Open',
    countersActive: 3,
    address: 'FCI Godown Enclave, Ibrahimpatnam - 521456',
    contactNumber: '+91 866 288 4402',
    isRecommended: false
  }
];

export const initialQueueList: QueueItem[] = [
  { token: 'A-095', farmerName: 'Venkat Rao', crop: 'Paddy', quantityQuintals: 30, status: 'completed', counter: 'Counter 1', estimatedWaitMinutes: 0 },
  { token: 'A-096', farmerName: 'Anji Reddy', crop: 'Wheat', quantityQuintals: 22, status: 'completed', counter: 'Counter 3', estimatedWaitMinutes: 0 },
  { token: 'A-097', farmerName: 'Krishna Murthy', crop: 'Paddy', quantityQuintals: 28, status: 'serving', counter: 'Counter 2', estimatedWaitMinutes: 0 },
  { token: 'A-098', farmerName: 'Srinivasa Rao', crop: 'Paddy', quantityQuintals: 20, status: 'waiting', estimatedWaitMinutes: 5 },
  { token: 'A-099', farmerName: 'Nageswara Rao', crop: 'Maize', quantityQuintals: 35, status: 'waiting', estimatedWaitMinutes: 10 },
  { token: 'A-100', farmerName: 'Subba Reddy', crop: 'Paddy', quantityQuintals: 25, status: 'waiting', estimatedWaitMinutes: 15 },
  { token: 'A-101', farmerName: 'Govinda Rajulu', crop: 'Cotton', quantityQuintals: 15, status: 'waiting', estimatedWaitMinutes: 20 },
  { token: 'A-102', farmerName: 'Appa Rao', crop: 'Paddy', quantityQuintals: 30, status: 'waiting', estimatedWaitMinutes: 25 },
  { token: 'A-103', farmerName: 'Somaiah', crop: 'Paddy', quantityQuintals: 24, status: 'waiting', estimatedWaitMinutes: 28 },
  { token: 'A-104', farmerName: 'Prasad Babu', crop: 'Groundnut', quantityQuintals: 18, status: 'waiting', estimatedWaitMinutes: 32 },
  { token: 'A-105', farmerName: 'Ravi Kumar (You)', crop: 'Paddy', quantityQuintals: 25, status: 'waiting', estimatedWaitMinutes: 35, isCurrentUser: true },
  { token: 'A-106', farmerName: 'Suresh Chandra', crop: 'Paddy', quantityQuintals: 18, status: 'waiting', estimatedWaitMinutes: 40 },
  { token: 'A-107', farmerName: 'Lakshmi Devi', crop: 'Cotton', quantityQuintals: 32, status: 'waiting', estimatedWaitMinutes: 45 },
  { token: 'A-108', farmerName: 'Ramesh Naidu', crop: 'Maize', quantityQuintals: 20, status: 'waiting', estimatedWaitMinutes: 50 },
];

export const initialBookings: Booking[] = [
  {
    id: 'BK-2026-9081',
    token: 'A-105',
    farmerName: 'Ravi Kumar',
    farmerMobile: '+91 98480 12345',
    crop: 'Paddy (Grade-A)',
    quantityQuintals: 25,
    centreId: 'centre-1',
    centreName: 'Mylavaram Procurement Centre',
    date: '12 September 2026',
    timeSlot: '10:30 AM - 11:00 AM',
    status: 'upcoming',
    createdAt: '08 Sep 2026',
    counterAssigned: 'Counter 2',
    estimatedWaitMinutes: 35
  },
  {
    id: 'BK-2026-8419',
    token: 'A-042',
    farmerName: 'Ravi Kumar',
    farmerMobile: '+91 98480 12345',
    crop: 'Maize (Corn)',
    quantityQuintals: 18,
    centreId: 'centre-1',
    centreName: 'Mylavaram Procurement Centre',
    date: '28 August 2026',
    timeSlot: '09:30 AM - 10:00 AM',
    status: 'completed',
    createdAt: '24 Aug 2026',
    counterAssigned: 'Counter 1',
    estimatedWaitMinutes: 0
  },
  {
    id: 'BK-2026-7730',
    token: 'B-014',
    farmerName: 'Ravi Kumar',
    farmerMobile: '+91 98480 12345',
    crop: 'Groundnut (in shell)',
    quantityQuintals: 12,
    centreId: 'centre-2',
    centreName: 'Gollapudi Procurement Centre',
    date: '15 July 2026',
    timeSlot: '02:00 PM - 02:30 PM',
    status: 'completed',
    createdAt: '10 Jul 2026',
    counterAssigned: 'Counter 4',
    estimatedWaitMinutes: 0
  }
];

export const initialProcurementDetails: ProcurementDetails = {
  bookingId: 'BK-2026-9081',
  token: 'A-105',
  farmerName: 'Ravi Kumar',
  crop: 'Paddy (Grade-A)',
  expectedQuantity: 25,
  actualProcuredQuantity: 25,
  grossWeight: 25.4,
  tareWeight: 0.4,
  netWeight: 25.0,
  moisturePercentage: 14.8,
  maxAllowedMoisture: 17.0,
  foreignMatterPercentage: 0.6,
  qualityStatus: 'Accepted',
  expectedAmount: 58000,
  procuredAmount: 58000,
  weighbridgeSlipId: 'WB-MYL-2026-8842',
  inspectingOfficer: 'Sri P. Venkanna, Agricultural Officer (QC)',
  centreName: 'Mylavaram Procurement Centre',
  currentStepIndex: 5,
  steps: [
    {
      id: 'step-1',
      title: 'Booking Confirmed',
      description: 'Slot allocated at Mylavaram Centre for 12 Sep 2026, 10:30 AM.',
      timestamp: '08 Sep 2026, 04:12 PM',
      status: 'completed',
      icon: 'CalendarCheck'
    },
    {
      id: 'step-2',
      title: 'Farmer Arrived & Gate Token Scanned',
      description: 'Tractor trailer (AP 16 TX 4920) arrived at entry gate. RFID token issued.',
      timestamp: '12 Sep 2026, 10:14 AM',
      status: 'completed',
      icon: 'Truck'
    },
    {
      id: 'step-3',
      title: 'Queue Position Completed',
      description: 'Token called to Unloading Bay / Counter 2.',
      timestamp: '12 Sep 2026, 10:48 AM',
      status: 'completed',
      icon: 'Users'
    },
    {
      id: 'step-4',
      title: 'Document & Aadhaar Verification',
      description: 'Pattadar Passbook No. AP/NTR/2024/7821 verified with e-Crop portal database.',
      timestamp: '12 Sep 2026, 10:55 AM',
      status: 'completed',
      icon: 'FileCheck'
    },
    {
      id: 'step-5',
      title: 'Automated Weighbridge Weighing',
      description: 'Gross: 25.40 Quintals, Tare: 0.40 Q, Net Weight: 25.00 Quintals recorded digitally.',
      timestamp: '12 Sep 2026, 11:10 AM',
      status: 'completed',
      icon: 'Scale'
    },
    {
      id: 'step-6',
      title: 'Quality & Moisture Inspection',
      description: 'Moisture analyzer reading: 14.8% (Allowed: <= 17.0%). FAQ standards met.',
      timestamp: '12 Sep 2026, 11:22 AM',
      status: 'in_progress',
      icon: 'CheckCircle2'
    },
    {
      id: 'step-7',
      title: 'Procurement Slip & Gate Pass Generation',
      description: 'Final digital procurement receipt signed with cryptographic hash.',
      timestamp: 'Estimated 11:35 AM',
      status: 'upcoming',
      icon: 'Receipt'
    },
    {
      id: 'step-8',
      title: 'Payment Advice to PFMS (DBT)',
      description: 'Treasury bill forwarded to Public Financial Management System for electronic transfer.',
      timestamp: 'Estimated within 24-48 hours',
      status: 'upcoming',
      icon: 'Landmark'
    }
  ]
};

export const initialPaymentDetails: PaymentDetails = {
  bookingId: 'BK-2026-9081',
  token: 'A-105',
  farmerName: 'Ravi Kumar',
  crop: 'Paddy (Grade-A)',
  quantityQuintals: 25,
  amount: 58000,
  status: 'Processing',
  pfmsReference: 'PFMS-2026-AP-99421',
  utrNumber: 'UTR202609120048123X',
  bankName: 'State Bank of India',
  accountNumberMasked: 'XXXX XXXX 1234',
  ifscCode: 'SBIN0001234',
  procurementDate: '12 September 2026',
  expectedCreditDate: '14 September 2026',
  paymentSteps: [
    {
      title: 'Procurement Completed & Bill Certified',
      description: 'Certified 25.00 Quintals @ ₹2,320 MSP = ₹58,000 net payable.',
      timestamp: '12 Sep 2026, 11:25 AM',
      completed: true
    },
    {
      title: 'Department of Consumer Affairs Treasury Approval',
      description: 'Sanction order approved by District Civil Supplies Officer.',
      timestamp: '12 Sep 2026, 01:15 PM',
      completed: true
    },
    {
      title: 'PFMS Batch Electronic Processing',
      description: 'Batch #PFMS-2026-AP-99421 forwarded to RBI Clearing House for DBT.',
      timestamp: '12 Sep 2026, 03:40 PM',
      completed: true,
      current: true
    },
    {
      title: 'Direct Benefit Transfer (DBT) Credited to Bank',
      description: 'Instant notification will be sent via SMS to registered mobile.',
      timestamp: 'Expected 14 Sep 2026',
      completed: false
    }
  ]
};

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Your Turn Is Approaching!',
    message: 'Token A-105: Only 7 farmers ahead of you at Mylavaram Centre. Please proceed to Waiting Bay 2.',
    type: 'queue',
    timestamp: 'Just now',
    read: false,
    actionUrl: '/queue'
  },
  {
    id: 'notif-2',
    title: 'Smart Centre Recommendation',
    message: 'Gollapudi Centre is currently operating at only 45% capacity with wait time of just 22 mins.',
    type: 'demand',
    timestamp: '1 hour ago',
    read: false,
    actionUrl: '/book-slot'
  },
  {
    id: 'notif-3',
    title: 'Previous Payment Credited',
    message: '₹41,760 for Maize procurement on 28 Aug has been successfully credited via PFMS DBT.',
    type: 'payment',
    timestamp: 'Yesterday',
    read: true,
    actionUrl: '/payments'
  },
  {
    id: 'notif-4',
    title: 'Slot Booking Reminder',
    message: 'Your Paddy slot is scheduled for today, 12 Sep at 10:30 AM at Mylavaram Procurement Centre.',
    type: 'system',
    timestamp: 'Yesterday',
    read: true,
    actionUrl: '/bookings'
  },
  {
    id: 'notif-5',
    title: 'Weather & Moisture Advisory',
    message: 'Rain forecast in NTR district tomorrow. Ensure your harvested paddy is covered with tarpaulin to maintain <17% moisture.',
    type: 'weather',
    timestamp: '2 days ago',
    read: true
  }
];

export const mockFarmerProfile: FarmerProfile = {
  name: 'Ravi Kumar',
  mobile: '******1234',
  maskedAadhaar: 'XXXX-XXXX-8921',
  state: 'Andhra Pradesh',
  district: 'NTR District',
  mandal: 'Mylavaram',
  village: 'Chandrala',
  landAcres: 6.5,
  surveyPassbookNo: 'AP/NTR/2024/7821',
  primaryCrops: ['Paddy', 'Maize', 'Cotton'],
  preferredLanguage: 'en',
  bankName: 'State Bank of India',
  bankAccountMasked: 'XXXX XXXX 1234',
  ifscCode: 'SBIN0001234',
  farmerRegistrationId: 'GOI-FARM-AP-892147',
  bankDetails: {
    bankName: 'State Bank of India',
    accountNumberMasked: 'XXXX XXXX 1234',
    ifsc: 'SBIN0001234'
  }
};
