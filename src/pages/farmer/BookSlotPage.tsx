import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockCrops, mockCentres } from '../../data/mockData';
import { CropInfo, ProcurementCentre } from '../../types';
import confetti from 'canvas-confetti';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Building2, 
  Scale, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ShieldCheck,
  Printer,
  Mic
} from 'lucide-react';
import { VoiceTokenBookingModal } from '../../components/common/VoiceTokenBookingModal';

export const BookSlotPage: React.FC = () => {
  const { language, profile, addNewBooking, navigate, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Selections
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(mockCrops[0]);
  const [quantity, setQuantity] = useState<number>(25);
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre>(mockCentres[0]);
  const [selectedDate, setSelectedDate] = useState<string>('12 September 2026');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM - 11:00 AM');

  // Success State Modal
  const [confirmedBooking, setConfirmedBooking] = useState<{
    token: string;
    id: string;
    crop: string;
    quantity: number;
    centre: string;
    date: string;
    time: string;
  } | null>(null);

  // Voice Assistant Modal for Illiterate Farmers
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Available dates for calendar step
  const calendarDates = [
    { date: '12 September 2026', day: 'Sat', status: 'Almost Full', slotsLeft: 14, percent: 78 },
    { date: '13 September 2026', day: 'Sun', status: 'Available', slotsLeft: 42, percent: 45 },
    { date: '14 September 2026', day: 'Mon', status: 'Available', slotsLeft: 60, percent: 30 },
    { date: '15 September 2026', day: 'Tue', status: 'Available', slotsLeft: 55, percent: 35 },
    { date: '16 September 2026', day: 'Wed', status: 'Fully Booked', slotsLeft: 0, percent: 100 },
    { date: '17 September 2026', day: 'Thu', status: 'Available', slotsLeft: 38, percent: 50 },
    { date: '18 September 2026', day: 'Fri', status: 'Available', slotsLeft: 45, percent: 40 },
  ];

  // Time slots
  const timeSlots = [
    { time: '09:00 AM - 09:30 AM', available: true, slotsRemaining: 4 },
    { time: '09:30 AM - 10:00 AM', available: true, slotsRemaining: 6 },
    { time: '10:00 AM - 10:30 AM', available: false, slotsRemaining: 0 },
    { time: '10:30 AM - 11:00 AM', available: true, slotsRemaining: 8 },
    { time: '11:00 AM - 11:30 AM', available: true, slotsRemaining: 11 },
    { time: '11:30 AM - 12:00 PM', available: true, slotsRemaining: 7 },
    { time: '02:00 PM - 02:30 PM', available: true, slotsRemaining: 15 },
    { time: '02:30 PM - 03:00 PM', available: true, slotsRemaining: 12 },
    { time: '03:00 PM - 03:30 PM', available: true, slotsRemaining: 9 },
  ];

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmBooking = () => {
    const booking = addNewBooking({
      farmerName: profile.name,
      farmerMobile: profile.mobile,
      crop: selectedCrop.name,
      quantityQuintals: quantity,
      centreId: selectedCentre.id,
      centreName: selectedCentre.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
    });

    // Trigger celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Safe fallback
    }

    setConfirmedBooking({
      token: booking.token,
      id: booking.id,
      crop: booking.crop,
      quantity: booking.quantityQuintals,
      centre: booking.centreName,
      date: booking.date,
      time: booking.timeSlot
    });
  };

  const stepsList = language === 'te' 
    ? ['పంట', 'పరిమాణం', 'కేంద్రం', 'తేదీ', 'సమయం', 'నిర్ధారణ']
    : language === 'hi'
    ? ['फसल', 'मात्रा', 'केंद्र', 'तारीख', 'समय', 'पुष्टि']
    : ['Crop', 'Quantity', 'Centre', 'Date', 'Time Slot', 'Confirm'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Title & Voice Assist Trigger */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {language === 'te' ? 'సేకరణ స్లాట్ బుక్ చేయండి' : 'Book Procurement Slot'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'te' 
              ? 'మీ ప్రాధాన్య కేంద్రంలో డిజిటల్ టోకెన్‌తో అన్‌లోడింగ్ బేను రిజర్వ్ చేసుకోండి.' 
              : 'Reserve an unloading bay at your preferred centre with guaranteed digital token.'}
          </p>
        </div>

        {/* Voice Booking Button for Uneducated / Rural Farmers */}
        <button
          type="button"
          id="book-slot-voice-assist-btn"
          onClick={() => setShowVoiceModal(true)}
          className="inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-2xl font-bold text-xs shadow-md border border-emerald-600/40 transition cursor-pointer hover:scale-102 active:scale-98 shrink-0"
        >
          <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
            <Mic className="w-4 h-4 animate-pulse text-emerald-950" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-amber-300 uppercase tracking-wider font-extrabold">
              {language === 'te' ? 'రైతుల కోసం' : 'Voice Assist'}
            </span>
            <span className="block text-xs font-bold text-white">
              {language === 'te' ? '🎙️ మాట్లాడి బుక్ చేయండి' : '🎙️ Speak & Book Token'}
            </span>
          </div>
        </button>
      </div>

      {/* Stepper Header */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[500px]">
          {stepsList.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <div key={stepName} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                        ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 font-extrabold' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <span className={`text-[11px] mt-1 font-medium whitespace-nowrap ${
                    isCurrent ? 'text-emerald-900 font-bold' : 'text-slate-500'
                  }`}>
                    {stepName}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 transition ${
                    isCompleted ? 'bg-emerald-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        {/* STEP 1: SELECT CROP */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Step 1: Select Your Crop
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the commodity you are bringing to the procurement center.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockCrops.map((crop) => {
                const isSelected = selectedCrop.id === crop.id;
                return (
                  <div
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                      isSelected 
                        ? 'border-emerald-700 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-700' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{crop.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{crop.name}</h3>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 mt-1 font-mono">
                        MSP: ₹{crop.mspPerQuintal} / Quintal
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Max Moisture Allowed: {crop.maxMoistureAllowed}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: ENTER EXPECTED QUANTITY */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Step 2: Enter Expected Quantity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Input the estimated weight in quintals for weighbridge allocation.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Estimated Produce (Quintals)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full text-center text-3xl font-black font-mono py-3 rounded-2xl border-2 border-emerald-700 bg-emerald-50/40 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    Quintals (Q)
                  </span>
                </div>
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex items-center justify-center gap-2">
                {[10, 20, 25, 30, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantity(val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      quantity === val 
                        ? 'bg-emerald-800 text-white border-emerald-800' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val} Q
                  </button>
                ))}
              </div>

              {/* Value Calculation Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Crop:</span>
                  <span className="font-bold text-slate-900">{selectedCrop.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Guaranteed MSP Rate:</span>
                  <span className="font-mono font-bold text-slate-900">₹{selectedCrop.mspPerQuintal} / Quintal</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Gunny Bags (50kg each):</span>
                  <span className="font-bold text-slate-900">~ {quantity * 2} Bags</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                  <span className="font-bold text-slate-800">Expected Gross MSP Payout:</span>
                  <span className="font-mono font-black text-emerald-800 text-base">
                    ₹{(quantity * selectedCrop.mspPerQuintal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT PROCUREMENT CENTRE */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Step 3: Select Procurement Centre
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centres ordered by distance and live queue wait time.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                <Sparkles className="w-3 h-3" />
                Smart Load Balancing
              </span>
            </div>

            <div className="space-y-3">
              {mockCentres.map((centre) => {
                const isSelected = selectedCentre.id === centre.id;
                return (
                  <div
                    key={centre.id}
                    onClick={() => setSelectedCentre(centre)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected 
                        ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{centre.name}</h3>
                        {centre.isRecommended && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                            Recommended (Shortest Wait)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{centre.address}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                        <span className="font-semibold text-emerald-800">
                          {centre.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span>Current Queue: <strong>{centre.currentQueue} farmers</strong></span>
                        <span>•</span>
                        <span>Avg Wait: <strong className="text-amber-700">{centre.avgWaitMinutes} min</strong></span>
                      </div>
                    </div>

                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Today's Capacity</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                Math.round((centre.todayBookings / centre.dailyCapacity) * 100) > 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-600'
                              }`} 
                              style={{ width: `${Math.round((centre.todayBookings / centre.dailyCapacity) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {Math.round((centre.todayBookings / centre.dailyCapacity) * 100)}%
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`mt-2 px-3 py-1 rounded-lg text-xs font-bold ${
                          isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Select Centre'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: CALENDAR */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Step 4: Select Procurement Date
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Slots are managed to avoid traffic bottlenecks and ensure guaranteed turnaround.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {calendarDates.map((item) => {
                const isSelected = selectedDate === item.date;
                const isFull = item.status === 'Fully Booked';
                return (
                  <button
                    key={item.date}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedDate(item.date)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                      isSelected 
                        ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700 shadow-xs' 
                        : isFull 
                          ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {item.day}
                      </span>
                      <span className="text-sm font-bold text-slate-900 block mt-0.5">
                        {item.date.split(' ')[0]} {item.date.split(' ')[1]}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isFull 
                          ? 'bg-rose-100 text-rose-800' 
                          : item.status === 'Almost Full' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isFull ? '0 slots left' : `${item.slotsLeft} slots remaining`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: TIME SLOTS */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Step 5: Select Time Slot
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                30-minute unloading slots ensure zero waiting at the gate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition ${
                      isSelected 
                        ? 'border-emerald-700 bg-emerald-50/80 ring-1 ring-emerald-700 font-bold' 
                        : !slot.available 
                          ? 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{slot.time}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {slot.available ? `${slot.slotsRemaining} bays open` : 'Slot Filled'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & CONFIRM */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Step 6: Review & Confirm Booking
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Please verify your procurement slot details before generating your digital token.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Farmer Name</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{profile.name}</span>
                  <span className="text-slate-500 text-[10px] font-mono">+91 {profile.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Procurement Centre</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedCentre.name}</span>
                  <span className="text-slate-500 text-[10px]">{selectedCentre.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Selected Crop</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedCrop.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Quantity</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">{quantity} Quintals</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Expected Payout</span>
                  <span className="text-sm font-bold text-emerald-800 mt-0.5 block font-mono">
                    ₹{(quantity * selectedCrop.mspPerQuintal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Scheduled Date</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Unloading Time Window</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">{selectedTimeSlot}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                Your slot is protected under the <strong>Government e-Procurement Guarantee</strong>. Unloading will be initiated within 30 minutes of scheduled arrival.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'te' ? 'వెనుకకు' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>{language === 'te' ? 'కొనసాగించండి' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmBooking}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/20 transition flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'te' ? 'బుకింగ్ నిర్ధారించి టోకెన్ పొందండి' : 'Confirm Booking & Generate Token'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Success Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center animate-in zoom-in-95">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
              {language === 'te' ? 'స్లాట్ ఖరారైంది' : 'SLOT CONFIRMED'}
            </span>

            <h2 className="text-2xl font-black text-slate-900 mt-2 font-heading">
              {language === 'te' ? 'డిజిటల్ టోకెన్ జారీ చేయబడింది!' : 'Digital Token Generated!'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'te' 
                ? 'మీ అపాయింట్‌మెంట్ కేంద్రీయ సేకరణ సర్వర్‌లో విజయవంతంగా నమోదైంది.' 
                : 'Your appointment has been registered on the central procurement server.'}
            </p>

            {/* Token Badge */}
            <div className="my-5 p-5 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl shadow-md border border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                {language === 'te' ? 'మీ టోకెన్ నంబర్' : 'YOUR TOKEN NUMBER'}
              </span>
              <span className="text-4xl font-black tracking-wider text-white font-mono block my-1">
                {confirmedBooking.token}
              </span>
              <span className="text-xs text-emerald-200">
                {confirmedBooking.centre}
              </span>
              <div className="mt-3 pt-3 border-t border-emerald-800/80 flex items-center justify-around text-xs text-emerald-100">
                <span>{confirmedBooking.date}</span>
                <span>•</span>
                <span>{confirmedBooking.time}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  navigate('/queue');
                }}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{language === 'te' ? 'లైవ్ క్యూ ట్రాకర్‌లో చూడండి' : 'View in Live Queue Tracker'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  navigate('/dashboard');
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                {language === 'te' ? 'రైతు డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి' : 'Return to Farmer Dashboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant Modal for Token Booking */}
      <VoiceTokenBookingModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onBookingComplete={(newBooking) => {
          setConfirmedBooking({
            token: newBooking.token,
            id: newBooking.id,
            crop: newBooking.crop,
            quantity: newBooking.quantityQuintals,
            centre: newBooking.centreName,
            date: newBooking.date,
            time: newBooking.timeSlot
          });
        }}
      />
    </div>
  );
};
