import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  Language, 
  UserRole, 
  QueueItem, 
  Booking, 
  ProcurementCentre, 
  ProcurementDetails, 
  ProcurementStep,
  PaymentDetails, 
  AppNotification, 
  FarmerProfile 
} from '../types';
import { 
  initialQueueList, 
  initialBookings, 
  mockCentres, 
  initialProcurementDetails, 
  initialPaymentDetails, 
  initialNotifications, 
  mockFarmerProfile 
} from '../data/mockData';
import { useAuth } from './AuthContext';
import {
  seedFirestoreCollectionsIfEmpty,
  subscribeToCentres,
  subscribeToQueueTokens,
  subscribeToBookings,
  subscribeToProcurement,
  subscribeToPayment,
  subscribeToNotifications,
  createBookingInFirestore,
  rescheduleBookingInFirestore,
  cancelBookingInFirestore,
  advanceQueueTokenInFirestore,
  advanceProcurementStepInFirestore,
  updatePaymentStatusInFirestore,
  markNotificationReadInFirestore,
  markAllNotificationsReadInFirestore,
  saveFarmerProfile,
  getFarmerProfile,
  submitFeedbackInFirestore
} from '../lib/firestoreService';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentPath: string;
  navigate: (path: string) => void;
  
  // Data state
  queueList: QueueItem[];
  bookings: Booking[];
  centres: ProcurementCentre[];
  procurementDetails: ProcurementDetails;
  procurementSteps: (ProcurementStep & { officerName?: string })[];
  paymentDetails: PaymentDetails;
  payments: {
    id: string;
    date: string;
    crop: string;
    quantityQuintals: number;
    ratePerQuintal: number;
    netAmount: number;
    status: 'credited' | 'processing' | 'approved' | 'initiated';
    bankName: string;
    accountNumberMasked: string;
    pfmsReferenceId: string;
  }[];
  notifications: AppNotification[];
  profile: FarmerProfile;
  setProfile: React.Dispatch<React.SetStateAction<FarmerProfile>>;
  
  // Computed active booking
  activeBooking: Booking | null;
  activeToken: string;
  servingToken: string;
  farmersAhead: number;
  estimatedWaitMinutes: number;
  isUsersTurn: boolean;
  
  // Simulation & Operational actions
  simulateNextToken: () => void;
  advanceProcurementStep: () => void;
  addNewBooking: (newBookingData: Omit<Booking, 'id' | 'token' | 'createdAt' | 'status'>) => Booking;
  rescheduleBooking: (bookingId: string, newDate: string, newTime: string) => void;
  cancelBooking: (bookingId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  submitFeedback: (rating: number, comment: string, category?: string) => Promise<void>;
  
  // UI & Demo helpers
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  audioAlertEnabled: boolean;
  setAudioAlertEnabled: (val: boolean) => void;
  isFirebaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, userRole } = useAuth();

  const [language, setLanguage] = useState<Language>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname && window.location.pathname !== '/' ? window.location.pathname : '/';
  });
  
  const [queueList, setQueueList] = useState<QueueItem[]>(initialQueueList);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [centres, setCentres] = useState<ProcurementCentre[]>(mockCentres);
  const [procurementDetails, setProcurementDetails] = useState<ProcurementDetails>(initialProcurementDetails);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(initialPaymentDetails);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [profile, setProfileState] = useState<FarmerProfile>(mockFarmerProfile);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  const initialBootRef = useRef<boolean>(false);

  // Synchronize browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update currentRole when userRole changes in auth
  useEffect(() => {
    if (userRole) {
      setCurrentRole(userRole);
    }
  }, [userRole]);

  // Synchronize Farmer Profile with Firestore
  useEffect(() => {
    if (currentUser) {
      getFarmerProfile(currentUser.uid).then(p => {
        if (p) {
          setProfileState(p);
        } else if (userProfile) {
          setProfileState(prev => ({
            ...prev,
            name: userProfile.name,
            mobile: userProfile.phone || prev.mobile,
            village: userProfile.village || prev.village,
            mandal: userProfile.mandal || prev.mandal,
            district: userProfile.district || prev.district,
            state: userProfile.state || prev.state,
            primaryCrops: [userProfile.mainCrop || 'Paddy (Grade-A)']
          }));
        }
      }).catch(() => {
        // Fallback gracefully to existing local profile
      });
    }
  }, [currentUser, userProfile]);

  // Set Profile wrapper to persist into Firestore
  const setProfile: React.Dispatch<React.SetStateAction<FarmerProfile>> = (action) => {
    setProfileState(prev => {
      const updated = typeof action === 'function' ? action(prev) : action;
      if (currentUser) {
        saveFarmerProfile(currentUser.uid, updated).catch(console.warn);
      }
      return updated;
    });
  };

  // Firestore Bootstrapping & Real-time Listeners
  useEffect(() => {
    if (!initialBootRef.current) {
      initialBootRef.current = true;
      seedFirestoreCollectionsIfEmpty().then(() => {
        setIsFirebaseConnected(true);
      }).catch(() => {
        setIsFirebaseConnected(false);
      });
    }

    // 1. Subscribe to Centres
    const unsubCentres = subscribeToCentres((updatedCentres) => {
      if (updatedCentres && updatedCentres.length > 0) {
        setCentres(updatedCentres);
      }
    });

    // 2. Subscribe to Queue Tokens (Live Real-Time Queue)
    const unsubQueue = subscribeToQueueTokens((updatedQueue) => {
      if (updatedQueue && updatedQueue.length > 0) {
        setQueueList(updatedQueue);
      }
    });

    // 3. Subscribe to Bookings
    const unsubBookings = subscribeToBookings(
      { 
        uid: currentUser?.uid, 
        role: userRole || currentRole, 
        centreId: userProfile?.centreId 
      },
      (updatedBookings) => {
        if (updatedBookings && updatedBookings.length > 0) {
          setBookings(updatedBookings);
        }
      }
    );

    // 4. Subscribe to Procurement details for active token / booking
    const activeBookingId = bookings.find(b => b.status === 'upcoming' || b.status === 'in_progress')?.id || initialProcurementDetails.bookingId;
    const unsubProc = subscribeToProcurement(activeBookingId, (proc) => {
      if (proc) setProcurementDetails(proc);
    });

    // 5. Subscribe to Payments
    const unsubPay = subscribeToPayment(activeBookingId, (pay) => {
      if (pay) setPaymentDetails(pay);
    });

    // 6. Subscribe to Notifications
    const unsubNotif = subscribeToNotifications(
      currentUser?.uid || 'sample-farmer-uid',
      (notifs) => {
        if (notifs && notifs.length > 0) {
          setNotifications(notifs);
        }
      }
    );

    return () => {
      unsubCentres();
      unsubQueue();
      unsubBookings();
      unsubProc();
      unsubPay();
      unsubNotif();
    };
  }, [currentUser?.uid, userRole, currentRole, userProfile?.centreId]);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const procurementSteps = procurementDetails.steps.map(s => ({
    ...s,
    officerName: 'Sri K. Venkateswarlu (QC Inspector)'
  }));

  const payments = [
    {
      id: 'PAY-2026-9081',
      date: '12 Sep 2026',
      crop: 'Paddy (Grade-A)',
      quantityQuintals: 25,
      ratePerQuintal: 2320,
      netAmount: 58000,
      status: (paymentDetails.status === 'Credited' ? 'credited' : 'processing') as 'credited' | 'processing',
      bankName: profile.bankName,
      accountNumberMasked: profile.bankAccountMasked,
      pfmsReferenceId: paymentDetails.pfmsReference
    },
    {
      id: 'PAY-2026-8812',
      date: '28 Aug 2026',
      crop: 'Paddy (Common)',
      quantityQuintals: 20,
      ratePerQuintal: 2300,
      netAmount: 46000,
      status: 'credited' as const,
      bankName: profile.bankName,
      accountNumberMasked: profile.bankAccountMasked,
      pfmsReferenceId: 'PFMS-2026-AP-88120'
    },
    {
      id: 'PAY-2026-7730',
      date: '15 Jul 2026',
      crop: 'Groundnut (in shell)',
      quantityQuintals: 12,
      ratePerQuintal: 6783,
      netAmount: 81396,
      status: 'credited' as const,
      bankName: profile.bankName,
      accountNumberMasked: profile.bankAccountMasked,
      pfmsReferenceId: 'PFMS-2026-AP-77301'
    }
  ];

  // Find active upcoming booking for current farmer (e.g. A-105)
  const activeBooking = bookings.find(b => b.status === 'upcoming' || b.status === 'in_progress') || bookings[0] || null;
  const activeToken = activeBooking ? activeBooking.token : 'A-105';

  // Find currently serving item
  const servingItem = queueList.find(q => q.status === 'serving') || queueList[0];
  const servingToken = servingItem ? servingItem.token : 'A-097';

  // Compute position relative to active user
  const userQueueIndex = queueList.findIndex(q => q.isCurrentUser || q.token === activeToken);
  const servingIndex = queueList.findIndex(q => q.status === 'serving');

  const farmersAhead = Math.max(0, userQueueIndex - servingIndex);
  const estimatedWaitMinutes = farmersAhead * 5;
  const isUsersTurn = userQueueIndex !== -1 && servingIndex !== -1 && userQueueIndex <= servingIndex;

  // Sound chime synthesizer for queue alerts
  const playChime = () => {
    if (!audioAlertEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);
    } catch {
      // Audio might be blocked until user gesture, safely ignore
    }
  };

  // Advances the queue by 1 token and syncs with Firestore
  const simulateNextToken = () => {
    setQueueList(prev => {
      const currentServingIdx = prev.findIndex(item => item.status === 'serving');
      if (currentServingIdx === -1 || currentServingIdx >= prev.length - 1) {
        showToast('End of active queue reached for this session.');
        return prev;
      }

      const currentItem = prev[currentServingIdx];
      const nextItem = prev[currentServingIdx + 1];

      const updated = prev.map((item, idx) => {
        if (idx === currentServingIdx) {
          return { ...item, status: 'completed' as const, estimatedWaitMinutes: 0 };
        }
        if (idx === currentServingIdx + 1) {
          return { ...item, status: 'serving' as const, counter: 'Counter 2', estimatedWaitMinutes: 0 };
        }
        if (idx > currentServingIdx + 1) {
          const ahead = idx - (currentServingIdx + 1);
          return { ...item, estimatedWaitMinutes: ahead * 5 };
        }
        return item;
      });

      playChime();

      // Synchronize in Firestore backend
      advanceQueueTokenInFirestore(currentItem.token, nextItem.token, 'Counter 2').catch(console.warn);

      if (nextItem.isCurrentUser || nextItem.token === activeToken) {
        showToast(`🔔 YOUR TURN NOW! Please proceed to Counter 2.`);
        setNotifications(n => [
          {
            id: `notif-${Date.now()}`,
            title: '🚨 YOUR TURN IS NOW!',
            message: `Token ${nextItem.token} is now called to Counter 2 for verification and weighing.`,
            type: 'queue',
            timestamp: 'Just now',
            read: false,
            actionUrl: '/queue'
          },
          ...n
        ]);
      } else {
        const remaining = updated.findIndex(i => i.isCurrentUser || i.token === activeToken) - (currentServingIdx + 1);
        if (remaining > 0) {
          showToast(`Token ${nextItem.token} called to Counter 2. You have ${remaining} farmers ahead (${remaining * 5} min).`);
        } else {
          showToast(`Token ${nextItem.token} called to Counter 2.`);
        }
      }

      return updated;
    });
  };

  // Advance procurement lifecycle step and sync with Firestore
  const advanceProcurementStep = () => {
    setProcurementDetails(prev => {
      const nextIdx = Math.min(prev.steps.length - 1, prev.currentStepIndex + 1);
      const updatedSteps = prev.steps.map((step, idx) => {
        if (idx < nextIdx) return { ...step, status: 'completed' as const };
        if (idx === nextIdx) return { ...step, status: 'in_progress' as const };
        return { ...step, status: 'upcoming' as const };
      });
      
      const newStep = updatedSteps[nextIdx];
      showToast(`Procurement Progress: Step advanced to "${newStep.title}"`);
      playChime();

      // Sync procurement progress in Firestore
      advanceProcurementStepInFirestore(prev.bookingId, nextIdx, updatedSteps).catch(console.warn);

      // If finished inspection, also advance payment
      if (nextIdx >= 6) {
        const nextPayStatus = nextIdx === 7 ? 'Credited' : 'Initiated';
        const nextPaySteps = paymentDetails.paymentSteps.map((ps, i) => {
          if (nextIdx === 7) return { ...ps, completed: true, current: false };
          if (i <= 2) return { ...ps, completed: true, current: i === 2 };
          return ps;
        });

        setPaymentDetails(p => ({
          ...p,
          status: nextPayStatus,
          paymentSteps: nextPaySteps
        }));

        updatePaymentStatusInFirestore(prev.bookingId, nextPayStatus, nextPaySteps).catch(console.warn);
      }

      return {
        ...prev,
        currentStepIndex: nextIdx,
        steps: updatedSteps
      };
    });
  };

  const addNewBooking = (data: Omit<Booking, 'id' | 'token' | 'createdAt' | 'status'>): Booking => {
    const tokenLetter = 'A';
    const nextTokenNum = 106 + Math.floor(Math.random() * 20);
    const generatedToken = `${tokenLetter}-${String(nextTokenNum).padStart(3, '0')}`;
    const newId = `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      ...data,
      id: newId,
      token: generatedToken,
      status: 'upcoming',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      counterAssigned: 'Counter 2',
      estimatedWaitMinutes: 25
    };

    // 1. Local state update
    setBookings(prev => [newBooking, ...prev]);

    // 2. Local queue update
    setQueueList(prev => [
      ...prev,
      {
        token: generatedToken,
        farmerName: `${data.farmerName} (New Booking)`,
        crop: data.crop,
        quantityQuintals: data.quantityQuintals,
        status: 'waiting',
        estimatedWaitMinutes: 45,
        isCurrentUser: true,
        arrivalTime: data.timeSlot
      }
    ]);

    // 3. Local notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Booking Confirmed!',
        message: `Token ${generatedToken} issued for ${data.crop} (${data.quantityQuintals} Q) at ${data.centreName}.`,
        type: 'system',
        timestamp: 'Just now',
        read: false,
        actionUrl: '/queue'
      },
      ...prev
    ]);

    // 4. Persist to Firestore backend
    const farmerUid = currentUser?.uid || 'guest-farmer';
    createBookingInFirestore(newBooking, farmerUid).catch(err => {
      console.warn('Booking stored locally (Firestore sync note):', err);
    });

    showToast(`Slot booked successfully! Your Token is ${generatedToken}.`);
    return newBooking;
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newTime: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          date: newDate,
          timeSlot: newTime,
          status: 'rescheduled'
        };
      }
      return b;
    }));
    rescheduleBookingInFirestore(bookingId, newDate, newTime).catch(console.warn);
    showToast(`Appointment rescheduled to ${newDate}, ${newTime}.`);
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'cancelled' };
      }
      return b;
    }));
    cancelBookingInFirestore(bookingId).catch(console.warn);
    showToast('Booking has been cancelled.');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    markNotificationReadInFirestore(id).catch(console.warn);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (currentUser) {
      markAllNotificationsReadInFirestore(currentUser.uid).catch(console.warn);
    }
    showToast('All notifications marked as read.');
  };

  const submitFeedback = async (rating: number, comment: string, category?: string) => {
    await submitFeedbackInFirestore({
      farmerUid: currentUser?.uid || 'guest-farmer',
      farmerName: profile.name,
      rating,
      comment,
      category: category || 'Procurement Experience',
      centreId: 'centre-1',
      centreName: 'Mylavaram Procurement Centre'
    });
    showToast('Thank you! Your feedback has been recorded in the central database.');
  };

  const resetDemoData = () => {
    setQueueList(initialQueueList);
    setBookings(initialBookings);
    setCentres(mockCentres);
    setProcurementDetails(initialProcurementDetails);
    setPaymentDetails(initialPaymentDetails);
    setNotifications(initialNotifications);
    setProfileState(mockFarmerProfile);
    showToast('Demo state reset to initial scenario.');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentRole,
        setCurrentRole,
        currentPath,
        navigate,
        queueList,
        bookings,
        centres,
        procurementDetails,
        procurementSteps,
        paymentDetails,
        payments,
        notifications,
        profile,
        setProfile,
        activeBooking,
        activeToken,
        servingToken,
        farmersAhead,
        estimatedWaitMinutes,
        isUsersTurn,
        simulateNextToken,
        advanceProcurementStep,
        addNewBooking,
        rescheduleBooking,
        cancelBooking,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        markNotificationRead: markNotificationAsRead,
        markAllNotificationsRead: markAllNotificationsAsRead,
        resetDemoData,
        submitFeedback,
        toastMessage,
        showToast,
        hideToast,
        demoMode,
        setDemoMode,
        audioAlertEnabled,
        setAudioAlertEnabled,
        isFirebaseConnected
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
