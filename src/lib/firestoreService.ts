import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit, 
  writeBatch 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  Booking, 
  QueueItem, 
  ProcurementCentre, 
  ProcurementDetails, 
  PaymentDetails, 
  AppNotification, 
  FarmerProfile, 
  UserProfile, 
  UserRole,
  Feedback,
  StaffProfile,
  AdminProfile,
  OTPVerification
} from '../types';
import { 
  mockCentres, 
  initialQueueList, 
  initialBookings, 
  initialProcurementDetails, 
  initialPaymentDetails, 
  initialNotifications, 
  mockFarmerProfile 
} from '../data/mockData';

// Collection references - Separate tables in Firebase
export const ADMINS_COLLECTION = 'admins';
export const USERS_COLLECTION = 'users';
export const STAFF_COLLECTION = 'staff';
export const FARMERS_COLLECTION = 'farmers';
export const CENTRES_COLLECTION = 'procurementCentres';
export const BOOKINGS_COLLECTION = 'bookings';
export const QUEUE_COLLECTION = 'queueTokens';
export const PROCUREMENTS_COLLECTION = 'procurements';
export const PAYMENTS_COLLECTION = 'payments';
export const NOTIFICATIONS_COLLECTION = 'notifications';
export const FEEDBACK_COLLECTION = 'feedback';
export const OTPS_COLLECTION = 'otps';

// ---------------------------------------------------------------------------
// 0. Verification & Account Presence Checks in Firebase
// ---------------------------------------------------------------------------

/**
 * Checks if the user data of a particular person exists in the Firebase `users` collection.
 */
export async function checkUserExistsInFirebase(identifier: string): Promise<boolean> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return false;

  try {
    // 1. Check if identifier is an email
    if (clean.includes('@')) {
      const q = query(collection(db, USERS_COLLECTION), where('email', '==', clean), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) return true;
    } else {
      // 2. Check if identifier is a 10-digit mobile number
      const q = query(collection(db, USERS_COLLECTION), where('phone', '==', clean), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) return true;
    }
    return false;
  } catch (err) {
    console.warn('Error checking user in Firebase users collection:', err);
    return false;
  }
}

/**
 * Finds user details in the Firebase `users` collection by email or phone.
 */
export async function findUserInFirebase(identifier: string): Promise<{ exists: boolean; user?: UserProfile }> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return { exists: false };

  try {
    if (clean.includes('@')) {
      const q = query(collection(db, USERS_COLLECTION), where('email', '==', clean), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const u = snap.docs[0].data() as UserProfile;
        return { exists: true, user: { ...u, uid: snap.docs[0].id } };
      }
    } else {
      const q = query(collection(db, USERS_COLLECTION), where('phone', '==', clean), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const u = snap.docs[0].data() as UserProfile;
        return { exists: true, user: { ...u, uid: snap.docs[0].id } };
      }
    }
    return { exists: false };
  } catch (err) {
    console.warn('Error finding user in Firebase users collection:', err);
    return { exists: false };
  }
}

/**
 * Retrieves recent OTP verification records for audit and administrator inspection.
 */
export async function getAllOtps(): Promise<OTPVerification[]> {
  try {
    const snap = await getDocs(collection(db, OTPS_COLLECTION));
    return snap.docs.map(doc => {
      const data = doc.data() as OTPVerification;
      return {
        ...data,
        id: doc.id
      };
    });
  } catch (error) {
    console.warn('Error fetching OTPs:', error);
    return [];
  }
}

/**
 * Checks if staff data exists in the Firebase `staff` collection.
 */
export async function checkStaffExistsInFirebase(email: string): Promise<{ exists: boolean; staff?: StaffProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { exists: false };

  try {
    const q = query(collection(db, STAFF_COLLECTION), where('email', '==', cleanEmail), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data() as StaffProfile;
      return { exists: true, staff: { ...docData, id: snap.docs[0].id } };
    }
    return { exists: false };
  } catch (err) {
    console.warn('Error checking staff in Firebase staff collection:', err);
    return { exists: false };
  }
}

// ---------------------------------------------------------------------------
// 1. Users Collection (Farmers / Citizens Table)
// ---------------------------------------------------------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile, { merge: true });
  } catch (error) {
    console.warn('Could not persist user profile to Firestore:', error);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map(doc => ({ ...(doc.data() as UserProfile), uid: doc.id }));
  } catch (error) {
    console.warn('Failed to load users from Firestore:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 2. Farmers Collection
// ---------------------------------------------------------------------------

export async function getFarmerProfile(uid: string): Promise<FarmerProfile | null> {
  try {
    const snap = await getDoc(doc(db, FARMERS_COLLECTION, uid));
    return snap.exists() ? (snap.data() as FarmerProfile) : null;
  } catch (error) {
    // If not found in farmers collection, try users collection
    try {
      const userSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (userSnap.exists()) {
        const u = userSnap.data() as UserProfile;
        return {
          name: u.name,
          mobile: u.phone,
          maskedAadhaar: 'XXXX-XXXX-9912',
          state: u.state || 'Andhra Pradesh',
          district: u.district || 'NTR District',
          mandal: u.mandal || 'Mylavaram',
          village: u.village || 'Chandrala',
          landAcres: 6.5,
          surveyPassbookNo: 'AP/NTR/2024/7821',
          primaryCrops: [u.mainCrop || 'Paddy (Grade-A)', 'Maize'],
          preferredLanguage: (u.preferredLanguage as 'en' | 'te' | 'hi') || 'en',
          bankName: 'State Bank of India',
          bankAccountMasked: 'XXXX-XXXX-4512',
          ifscCode: 'SBIN0001234',
          farmerRegistrationId: u.farmerId || 'AP/NTR/2026/8812'
        };
      }
    } catch {
      // ignore
    }
    return null;
  }
}

export async function saveFarmerProfile(uid: string, profile: FarmerProfile): Promise<void> {
  try {
    await setDoc(doc(db, FARMERS_COLLECTION, uid), {
      ...profile,
      uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${FARMERS_COLLECTION}/${uid}`);
  }
}

// ---------------------------------------------------------------------------
// 2b. Staff Collection (Separate Table in Firebase)
// ---------------------------------------------------------------------------

export async function getStaffProfile(uid: string): Promise<StaffProfile | null> {
  try {
    const snap = await getDoc(doc(db, STAFF_COLLECTION, uid));
    if (snap.exists()) {
      return { ...(snap.data() as StaffProfile), id: snap.id };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${STAFF_COLLECTION}/${uid}`);
    return null;
  }
}

export async function saveStaffProfile(staff: StaffProfile): Promise<void> {
  try {
    await setDoc(doc(db, STAFF_COLLECTION, staff.uid), staff, { merge: true });
  } catch (error) {
    console.warn('Could not persist staff profile to Firestore:', error);
  }
}

export async function getAllStaffMembers(): Promise<StaffProfile[]> {
  try {
    const snap = await getDocs(collection(db, STAFF_COLLECTION));
    return snap.docs.map(doc => ({ ...(doc.data() as StaffProfile), id: doc.id }));
  } catch (error) {
    console.warn('Failed to load staff from Firestore:', error);
    return [];
  }
}

export async function acceptStaffMember(staffId: string, adminEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const staffRef = doc(db, STAFF_COLLECTION, staffId);
    await setDoc(staffRef, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: adminEmail
    }, { merge: true });

    // Also sync in users table so role resolution stays consistent
    try {
      await setDoc(doc(db, USERS_COLLECTION, staffId), {
        role: 'staff',
        status: 'approved'
      }, { merge: true });
    } catch {
      // ignore
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return { success: false, error: error.message || 'Failed to accept staff member.' };
  }
}

export async function removeStaffMember(staffId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const staffRef = doc(db, STAFF_COLLECTION, staffId);
    await setDoc(staffRef, {
      status: 'removed',
      rejectionReason: reason || 'Access revoked by Administrator',
      removedAt: new Date().toISOString()
    }, { merge: true });

    try {
      await setDoc(doc(db, USERS_COLLECTION, staffId), {
        status: 'removed'
      }, { merge: true });
    } catch {
      // ignore
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return { success: false, error: error.message || 'Failed to remove staff member.' };
  }
}

// ---------------------------------------------------------------------------
// 2c. Admins Collection (Separate Table in Firebase)
// ---------------------------------------------------------------------------

export async function getAdminProfile(uid: string): Promise<AdminProfile | null> {
  try {
    const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    if (snap.exists()) {
      return { ...(snap.data() as AdminProfile), id: snap.id };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ADMINS_COLLECTION}/${uid}`);
    return null;
  }
}

export async function saveAdminProfile(admin: AdminProfile): Promise<void> {
  try {
    await setDoc(doc(db, ADMINS_COLLECTION, admin.uid), admin, { merge: true });
  } catch (error) {
    console.warn('Could not persist admin profile to Firestore:', error);
  }
}

export async function getAllAdmins(): Promise<AdminProfile[]> {
  try {
    const snap = await getDocs(collection(db, ADMINS_COLLECTION));
    return snap.docs.map(doc => ({ ...(doc.data() as AdminProfile), id: doc.id, uid: doc.id }));
  } catch (error) {
    console.warn('Failed to load admins from Firestore:', error);
    return [];
  }
}

/**
 * Checks if an administrator exists in the Firebase `admins` collection by email or phone.
 */
export async function checkAdminExistsInFirebase(identifier: string): Promise<{ exists: boolean; admin?: AdminProfile }> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return { exists: false };

  try {
    if (clean.includes('@')) {
      const q = query(collection(db, ADMINS_COLLECTION), where('email', '==', clean), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data() as AdminProfile;
        return { exists: true, admin: { ...docData, id: snap.docs[0].id } };
      }
    } else {
      const q = query(collection(db, ADMINS_COLLECTION), where('phone', '==', clean), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data() as AdminProfile;
        return { exists: true, admin: { ...docData, id: snap.docs[0].id } };
      }
    }
    return { exists: false };
  } catch (err) {
    console.warn('Error checking admin in Firebase admins collection:', err);
    return { exists: false };
  }
}

export async function acceptAdminMember(adminId: string, approvedBy?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, adminId);
    await setDoc(adminRef, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: approvedBy || 'Apex Administrator'
    }, { merge: true });

    try {
      const userRef = doc(db, USERS_COLLECTION, adminId);
      await setDoc(userRef, {
        status: 'approved',
        approvedAt: new Date().toISOString()
      }, { merge: true });
    } catch {
      // non-blocking
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return { success: false, error: error.message || 'Failed to approve administrator application.' };
  }
}

export async function rejectAdminMember(adminId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, adminId);
    await setDoc(adminRef, {
      status: 'rejected',
      rejectionReason: reason || 'Application not accepted by Apex Administrator',
      rejectedAt: new Date().toISOString()
    }, { merge: true });

    try {
      const userRef = doc(db, USERS_COLLECTION, adminId);
      await setDoc(userRef, {
        status: 'rejected',
        rejectionReason: reason || 'Application not accepted by Apex Administrator'
      }, { merge: true });
    } catch {
      // non-blocking
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return { success: false, error: error.message || 'Failed to reject administrator application.' };
  }
}

export async function getFirebaseTableStats(): Promise<{ admins: number; users: number; staff: number; farmers: number }> {
  if (!auth.currentUser) {
    return { admins: 1, users: 0, staff: 0, farmers: 0 };
  }
  try {
    const [adminsSnap, usersSnap, staffSnap, farmersSnap] = await Promise.all([
      getDocs(collection(db, ADMINS_COLLECTION)).catch(() => ({ size: 1 })),
      getDocs(collection(db, USERS_COLLECTION)).catch(() => ({ size: 0 })),
      getDocs(collection(db, STAFF_COLLECTION)).catch(() => ({ size: 0 })),
      getDocs(collection(db, FARMERS_COLLECTION)).catch(() => ({ size: 0 }))
    ]);
    return {
      admins: Math.max(adminsSnap.size, 1),
      users: usersSnap.size,
      staff: staffSnap.size,
      farmers: farmersSnap.size
    };
  } catch {
    return { admins: 1, users: 0, staff: 0, farmers: 0 };
  }
}

export async function getAllFarmers(): Promise<(FarmerProfile & { uid: string })[]> {
  if (!auth.currentUser) {
    return [];
  }
  try {
    const snap = await getDocs(collection(db, FARMERS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as FarmerProfile & { uid: string }));
    }
    // Fallback: check users collection for role === 'farmer'
    const userQuery = query(collection(db, USERS_COLLECTION), where('role', '==', 'farmer'));
    const userSnap = await getDocs(userQuery);
    return userSnap.docs.map(d => {
      const u = d.data() as UserProfile;
      return {
        uid: d.id,
        name: u.name,
        mobile: u.phone,
        maskedAadhaar: 'XXXX-XXXX-9912',
        state: u.state || 'Andhra Pradesh',
        district: u.district || 'NTR District',
        mandal: u.mandal || 'Mylavaram',
        village: u.village || 'Chandrala',
        landAcres: 6.5,
        surveyPassbookNo: 'AP/NTR/2024/7821',
        primaryCrops: [u.mainCrop || 'Paddy (Grade-A)'],
        preferredLanguage: (u.preferredLanguage as 'en' | 'te' | 'hi') || 'en',
        bankName: 'State Bank of India',
        bankAccountMasked: 'XXXX-XXXX-4512',
        ifscCode: 'SBIN0001234',
        farmerRegistrationId: u.farmerId || 'AP/NTR/2026/8812'
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, FARMERS_COLLECTION);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 3. Procurement Centres Collection
// ---------------------------------------------------------------------------

export function subscribeToCentres(callback: (centres: ProcurementCentre[]) => void): () => void {
  const colRef = collection(db, CENTRES_COLLECTION);
  return onSnapshot(colRef, (snap) => {
    if (!snap.empty) {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProcurementCentre));
      callback(data);
    } else {
      callback(mockCentres);
    }
  }, (err) => {
    console.warn('Centres listener offline/fallback:', err);
    callback(mockCentres);
  });
}

export async function updateCentreQueue(centreId: string, currentQueue: number): Promise<void> {
  try {
    const centreRef = doc(db, CENTRES_COLLECTION, centreId);
    await updateDoc(centreRef, { 
      currentQueue,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CENTRES_COLLECTION}/${centreId}`);
  }
}

// ---------------------------------------------------------------------------
// 4. Bookings Collection
// ---------------------------------------------------------------------------

export function subscribeToBookings(
  options: { uid?: string; role?: UserRole; centreId?: string },
  callback: (bookings: Booking[]) => void
): () => void {
  const colRef = collection(db, BOOKINGS_COLLECTION);
  let q = query(colRef, orderBy('createdAt', 'desc'));

  // If farmer, filter by their farmerUid
  if (options.role === 'farmer' && options.uid) {
    q = query(colRef, where('farmerUid', '==', options.uid));
  } else if (options.role === 'staff' && options.centreId) {
    q = query(colRef, where('centreId', '==', options.centreId));
  }

  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      callback(list);
    } else {
      callback(options.role === 'farmer' ? initialBookings : initialBookings);
    }
  }, (err) => {
    console.warn('Bookings listener offline/fallback:', err);
    callback(initialBookings);
  });
}

export async function createBookingInFirestore(booking: Booking, farmerUid: string): Promise<Booking> {
  const bookingWithUid = {
    ...booking,
    farmerUid,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), bookingWithUid);

    // Also push a QueueToken into queueTokens collection
    const queueDocId = `token-${booking.token}`;
    await setDoc(doc(db, QUEUE_COLLECTION, queueDocId), {
      token: booking.token,
      bookingId: booking.id,
      farmerUid,
      farmerName: booking.farmerName,
      crop: booking.crop,
      quantityQuintals: booking.quantityQuintals,
      centreId: booking.centreId,
      status: 'waiting',
      counter: booking.counterAssigned || 'Counter 2',
      estimatedWaitMinutes: booking.estimatedWaitMinutes || 35,
      arrivalTime: booking.timeSlot,
      timeSlot: booking.timeSlot,
      updatedAt: new Date().toISOString()
    });

    // Also push initial notification
    const notifId = `notif-${Date.now()}`;
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), {
      id: notifId,
      recipientUid: farmerUid,
      title: 'Booking Confirmed!',
      message: `Token ${booking.token} issued for ${booking.crop} (${booking.quantityQuintals} Q) at ${booking.centreName}.`,
      type: 'system',
      timestamp: 'Just now',
      read: false,
      actionUrl: '/queue'
    });

    return bookingWithUid;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${BOOKINGS_COLLECTION}/${booking.id}`);
    return bookingWithUid;
  }
}

export async function rescheduleBookingInFirestore(bookingId: string, newDate: string, newTimeSlot: string): Promise<void> {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      date: newDate,
      timeSlot: newTimeSlot,
      status: 'rescheduled',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
  }
}

export async function cancelBookingInFirestore(bookingId: string): Promise<void> {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Queue Tokens Collection
// ---------------------------------------------------------------------------

export function subscribeToQueueTokens(callback: (items: QueueItem[]) => void): () => void {
  const colRef = collection(db, QUEUE_COLLECTION);
  return onSnapshot(colRef, (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => d.data() as QueueItem);
      // Sort so serving is first, then waiting, then completed
      items.sort((a, b) => {
        const order = { serving: 0, waiting: 1, held: 2, completed: 3, skipped: 4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5);
      });
      callback(items);
    } else {
      callback(initialQueueList);
    }
  }, (err) => {
    console.warn('Queue listener offline/fallback:', err);
    callback(initialQueueList);
  });
}

export async function advanceQueueTokenInFirestore(
  servingToken: string, 
  nextServingToken: string, 
  counterName: string = 'Counter 2'
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const snap = await getDocs(collection(db, QUEUE_COLLECTION));
    
    snap.docs.forEach(docSnap => {
      const data = docSnap.data() as QueueItem;
      if (data.token === servingToken) {
        batch.update(docSnap.ref, { 
          status: 'completed', 
          estimatedWaitMinutes: 0,
          updatedAt: new Date().toISOString()
        });
      } else if (data.token === nextServingToken) {
        batch.update(docSnap.ref, { 
          status: 'serving', 
          counter: counterName, 
          estimatedWaitMinutes: 0,
          updatedAt: new Date().toISOString()
        });
      }
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, QUEUE_COLLECTION);
  }
}

// ---------------------------------------------------------------------------
// 6. Procurements Collection
// ---------------------------------------------------------------------------

export function subscribeToProcurement(
  bookingIdOrToken: string,
  callback: (procurement: ProcurementDetails) => void
): () => void {
  const docRef = doc(db, PROCUREMENTS_COLLECTION, bookingIdOrToken);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as ProcurementDetails);
    } else {
      callback(initialProcurementDetails);
    }
  }, (err) => {
    console.warn('Procurement listener offline/fallback:', err);
    callback(initialProcurementDetails);
  });
}

export async function advanceProcurementStepInFirestore(
  bookingId: string, 
  newIndex: number, 
  updatedSteps: ProcurementDetails['steps']
): Promise<void> {
  try {
    const docRef = doc(db, PROCUREMENTS_COLLECTION, bookingId);
    await setDoc(docRef, {
      currentStepIndex: newIndex,
      steps: updatedSteps,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PROCUREMENTS_COLLECTION}/${bookingId}`);
  }
}

export async function saveProcurementInspection(details: ProcurementDetails): Promise<void> {
  try {
    const docRef = doc(db, PROCUREMENTS_COLLECTION, details.bookingId);
    await setDoc(docRef, {
      ...details,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PROCUREMENTS_COLLECTION}/${details.bookingId}`);
  }
}

// ---------------------------------------------------------------------------
// 7. Payments Collection
// ---------------------------------------------------------------------------

export function subscribeToPayment(
  bookingId: string,
  callback: (details: PaymentDetails) => void
): () => void {
  const docRef = doc(db, PAYMENTS_COLLECTION, bookingId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as PaymentDetails);
    } else {
      callback(initialPaymentDetails);
    }
  }, (err) => {
    console.warn('Payment listener offline/fallback:', err);
    callback(initialPaymentDetails);
  });
}

export async function updatePaymentStatusInFirestore(
  bookingId: string, 
  status: PaymentDetails['status'],
  paymentSteps?: PaymentDetails['paymentSteps']
): Promise<void> {
  try {
    const docRef = doc(db, PAYMENTS_COLLECTION, bookingId);
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (paymentSteps) {
      updateData.paymentSteps = paymentSteps;
    }
    await setDoc(docRef, updateData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PAYMENTS_COLLECTION}/${bookingId}`);
  }
}

// ---------------------------------------------------------------------------
// 8. Notifications Collection
// ---------------------------------------------------------------------------

export function subscribeToNotifications(
  recipientUid: string,
  callback: (notifications: AppNotification[]) => void
): () => void {
  const colRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(colRef, where('recipientUid', '==', recipientUid));

  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      callback(notifs);
    } else {
      callback(initialNotifications);
    }
  }, (err) => {
    console.warn('Notifications listener offline/fallback:', err);
    callback(initialNotifications);
  });
}

export async function markNotificationReadInFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATIONS_COLLECTION}/${id}`);
  }
}

export async function markAllNotificationsReadInFirestore(recipientUid: string): Promise<void> {
  try {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('recipientUid', '==', recipientUid));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, NOTIFICATIONS_COLLECTION);
  }
}

// ---------------------------------------------------------------------------
// 9. Feedback Collection
// ---------------------------------------------------------------------------

export async function submitFeedbackInFirestore(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<string> {
  const feedbackId = `FB-${Date.now()}`;
  const fullFeedback: Feedback = {
    ...feedback,
    id: feedbackId,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, FEEDBACK_COLLECTION, feedbackId), fullFeedback);
    return feedbackId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${FEEDBACK_COLLECTION}/${feedbackId}`);
    return feedbackId;
  }
}

export async function getAllFeedbackFromFirestore(): Promise<Feedback[]> {
  try {
    const snap = await getDocs(collection(db, FEEDBACK_COLLECTION));
    return snap.docs.map(d => d.data() as Feedback);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, FEEDBACK_COLLECTION);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 10. Initial Database Bootstrapping / Seeding
// ---------------------------------------------------------------------------

let seedingAttempted = false;

export async function seedFirestoreCollectionsIfEmpty(): Promise<void> {
  if (seedingAttempted) return;
  seedingAttempted = true;

  try {
    // Check centres
    const centresSnap = await getDocs(collection(db, CENTRES_COLLECTION));
    if (centresSnap.empty) {
      console.log('Seeding initial procurement centres into Firestore...');
      const batch = writeBatch(db);
      mockCentres.forEach(centre => {
        const ref = doc(db, CENTRES_COLLECTION, centre.id);
        batch.set(ref, { ...centre, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
    }

    // Check queue
    const queueSnap = await getDocs(collection(db, QUEUE_COLLECTION));
    if (queueSnap.empty) {
      console.log('Seeding initial live queue tokens into Firestore...');
      const batch = writeBatch(db);
      initialQueueList.forEach((item, index) => {
        const ref = doc(db, QUEUE_COLLECTION, `token-${item.token}`);
        batch.set(ref, {
          ...item,
          centreId: 'centre-1',
          bookingId: `BK-2026-000${index + 1}`,
          farmerUid: item.isCurrentUser ? 'sample-farmer-uid' : `farmer-${index}`,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // Check initial procurement
    const procRef = doc(db, PROCUREMENTS_COLLECTION, initialProcurementDetails.bookingId);
    const procSnap = await getDoc(procRef);
    if (!procSnap.exists()) {
      await setDoc(procRef, {
        ...initialProcurementDetails,
        farmerUid: 'sample-farmer-uid',
        updatedAt: new Date().toISOString()
      });
    }

    // Check initial payment
    const payRef = doc(db, PAYMENTS_COLLECTION, initialPaymentDetails.bookingId);
    const paySnap = await getDoc(payRef);
    if (!paySnap.exists()) {
      await setDoc(payRef, {
        ...initialPaymentDetails,
        farmerUid: 'sample-farmer-uid',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Initial seeding encountered non-fatal error (likely offline or permissions):', err);
  }
}
